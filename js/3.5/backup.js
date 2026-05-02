// backup.js – SD kártya konfig-backup
// Elérhető bármely admin oldalon a nav sávból (setupnav.js tölti be)

(function () {
	var _modal = null;
	var _cancelFlag = false;

	var JS_FILES = [
		'js/chart.js', 'js/config.js', 'js/dict.js', 'js/dygraph-combined.js',
		'js/dygraph-combined.js.map', 'js/dygraph-options.js', 'js/dygraph.css',
		'js/dygraph.js', 'js/dygraph.min.js', 'js/emanager.js', 'js/evlog.js',
		'js/favicon.ico', 'js/func.js', 'js/groups.js', 'js/index.js',
		'js/input.js', 'js/jszip.min.js', 'js/load.js', 'js/nav.js',
		'js/output.js', 'js/pcaout.js', 'js/save.js', 'js/setup.js',
		'js/setupnav.js', 'js/setup_up.js', 'js/style.css', 'js/styleBlue.css',
		'js/timer.js', 'js/users.js',
		'js/lang/DE.js', 'js/lang/DE.json', 'js/lang/EN.js', 'js/lang/EN.json',
		'js/lang/FR.js', 'js/lang/FR.json', 'js/lang/HU.js', 'js/lang/HU.json',
		'js/lang/langinfo.json'
	];

	function pad2(n) { return n < 10 ? '0' + n : '' + n; }

	function sleep(ms) {
		return new Promise(function (resolve) { setTimeout(resolve, ms); });
	}

	function loadJSZip() {
		if (typeof JSZip !== 'undefined') return Promise.resolve();
		return new Promise(function (resolve, reject) {
			var s = document.createElement('script');
			s.src = (typeof host !== 'undefined' ? host : '/js/3.5/') + 'jszip.min.js';
			s.onload = resolve;
			s.onerror = reject;
			document.head.appendChild(s);
		});
	}

	function buildConfigFileList() {
		var list = [];

		list.push('favicon.ico');
		list.push('htm/nav.htm');
		list.push('htm/setupnav.htm');

		var rootFiles = [
			'backup.jsn',
			'f_desc.xml', 'g_desc.xml', 'h_desc.xml', 'p_desc.xml',
			'r_desc.xml', 's_desc.xml', 'slo_desc.xml', 't_desc.xml',
			'sensors.bak', 'username.xml', 'timer.csv'
		];
		rootFiles.forEach(function (f) { list.push(f); });

		var slotFiles = [
			'globals.xml', 'relays.xml', 'fet.xml',
			'r_prot.xml', 'r_group.xml', 'switches.xml',
			'PCA_OUT.xml', 'EMANAGER.jsn'
		];
		for (var i = 0; i < 64; i++) {
			if (typeof slotExist !== 'undefined' && slotExist[i]) {
				slotFiles.forEach(function (f) {
					list.push('slot_' + i + '/' + f);
				});
			}
		}

		return list;
	}

	async function fetchToZip(zip, devicePath, zipPath) {
		try {
			var resp = await fetch('/' + devicePath);
			if (resp.ok) {
				zip.file(zipPath, await resp.blob());
				return true;
			}
		} catch (e) { }
		return false;
	}

	async function fetchPhase(zip, files, progressEl, statusEl, pctFrom, pctTo) {
		var total = files.length;
		for (var i = 0; i < files.length; i++) {
			if (_cancelFlag) return;
			statusEl.textContent = files[i] + ' (' + (i + 1) + '/' + total + ')';
			var ok = await fetchToZip(zip, files[i], files[i]);
			progressEl.value = Math.round(pctFrom + (i + 1) / total * (pctTo - pctFrom));
			await sleep(ok ? 300 : 50);
		}
	}

	async function scanEventLogs(zip, progressEl, statusEl, pctFrom) {
		var consecutiveMisses = 0;
		var d = new Date();
		var day = 0;

		while (consecutiveMisses < 30 && !_cancelFlag) {
			var filename = 'e_' + String(d.getFullYear()).slice(2) + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '.csv';
			var path = 'ev_log/' + filename;

			statusEl.textContent = path;
			progressEl.value = Math.min(99, pctFrom + day * 0.07);

			var ok = await fetchToZip(zip, path, path);
			consecutiveMisses = ok ? 0 : consecutiveMisses + 1;
			d.setDate(d.getDate() - 1);
			day++;

			await sleep(ok ? 300 : 50);
		}
	}

	async function startBackup() {
		_cancelFlag = false;
		var includeJS   = document.getElementById('bk_cbJS').checked;
		var includeLogs = document.getElementById('bk_cbLog').checked;

		var progressEl = document.getElementById('bk_progress');
		var statusEl   = document.getElementById('bk_status');
		var btnStart   = document.getElementById('bk_btnStart');

		btnStart.disabled = true;
		document.getElementById('bk_cbJS').disabled = true;
		document.getElementById('bk_cbLog').disabled = true;
		progressEl.style.display = 'block';
		statusEl.textContent = '';

		try {
			await loadJSZip();
		} catch (e) {
			statusEl.textContent = 'JSZip load error';
			resetModal();
			return;
		}

		if (_cancelFlag) return;

		var zip = new JSZip();

		// Progress felosztás a kiválasztott fázisok szerint
		var phases = 1 + (includeJS ? 1 : 0) + (includeLogs ? 1 : 0);
		var pct = 0;
		var step = Math.floor(100 / phases);

		await fetchPhase(zip, buildConfigFileList(), progressEl, statusEl, pct, pct + step);
		pct += step;

		if (includeJS && !_cancelFlag) {
			await fetchPhase(zip, JS_FILES, progressEl, statusEl, pct, pct + step);
			pct += step;
		}

		if (includeLogs && !_cancelFlag) {
			await scanEventLogs(zip, progressEl, statusEl, pct);
		}

		if (_cancelFlag) return;

		statusEl.textContent = str_BackupDone;
		progressEl.value = 100;

		var deviceName = (typeof MYIOname !== 'undefined' && MYIOname)
			? MYIOname.replace(/[^a-zA-Z0-9_À-ɏ\-]/g, '_')
			: 'myio';
		var now = new Date();
		var ts = now.getFullYear() + pad2(now.getMonth() + 1) + pad2(now.getDate()) +
			'_' + pad2(now.getHours()) + pad2(now.getMinutes()) + pad2(now.getSeconds());
		var filename = 'myio_backup_' + deviceName + '_' + ts + '.zip';

		var content = await zip.generateAsync({ type: 'blob' });
		var a = document.createElement('a');
		a.href = URL.createObjectURL(content);
		a.download = filename;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(a.href);

		btnStart.disabled = false;
		document.getElementById('bk_cbJS').disabled = false;
		document.getElementById('bk_cbLog').disabled = false;
	}

	function closeModal() {
		_cancelFlag = true;
		if (_modal) _modal.style.display = 'none';
		setTimeout(resetModal, 200);
	}

	function resetModal() {
		_cancelFlag = false;
		var ids = ['bk_progress', 'bk_status', 'bk_btnStart', 'bk_cbJS', 'bk_warnJS', 'bk_cbLog', 'bk_warnLog'];
		var els = {};
		ids.forEach(function (id) { els[id] = document.getElementById(id); });

		if (els['bk_progress'])  { els['bk_progress'].style.display = 'none'; els['bk_progress'].value = 0; }
		if (els['bk_status'])    els['bk_status'].textContent = '';
		if (els['bk_btnStart'])  { els['bk_btnStart'].disabled = false; els['bk_btnStart'].textContent = str_BackupStart; }
		if (els['bk_cbJS'])      { els['bk_cbJS'].disabled = false; els['bk_cbJS'].checked = false; }
		if (els['bk_warnJS'])    els['bk_warnJS'].style.display = 'none';
		if (els['bk_cbLog'])     { els['bk_cbLog'].disabled = false; els['bk_cbLog'].checked = false; }
		if (els['bk_warnLog'])   els['bk_warnLog'].style.display = 'none';
	}

	function makeOptRow(cbId, warnId, labelText, warnText) {
		var row = document.createElement('div');
		row.style.marginBottom = '4px';
		var cb = document.createElement('input');
		cb.type = 'checkbox'; cb.id = cbId;
		var lbl = document.createElement('label');
		lbl.htmlFor = cbId;
		lbl.textContent = ' ' + labelText;
		var warn = document.createElement('div');
		warn.id = warnId;
		warn.style.cssText = 'display:none;margin-left:22px;color:#888;font-size:12px;';
		warn.textContent = warnText;
		cb.addEventListener('change', function () {
			warn.style.display = this.checked ? 'block' : 'none';
		});
		row.appendChild(cb); row.appendChild(lbl);
		return [row, warn];
	}

	function buildModal() {
		var overlay = document.createElement('div');
		overlay.id = 'backupOverlay';
		overlay.style.cssText =
			'display:none;position:fixed;top:0;left:0;width:100%;height:100%;' +
			'background:rgba(0,0,0,0.5);z-index:9999;';

		var box = document.createElement('div');
		box.style.cssText =
			'background:#fff;margin:60px auto;padding:24px;max-width:480px;' +
			'border-radius:4px;font-size:14px;';

		var title = document.createElement('h3');
		title.style.marginTop = '0';
		title.textContent = str_Backup;
		box.appendChild(title);

		// Konfig checkbox (állandóan pipa)
		var rowCfg = document.createElement('div');
		rowCfg.style.marginBottom = '8px';
		var cbCfg = document.createElement('input');
		cbCfg.type = 'checkbox'; cbCfg.checked = true; cbCfg.disabled = true;
		var lblCfg = document.createElement('label');
		lblCfg.textContent = ' ' + str_BackupConfig;
		rowCfg.appendChild(cbCfg); rowCfg.appendChild(lblCfg);
		box.appendChild(rowCfg);

		// JS checkbox
		var jsElems = makeOptRow('bk_cbJS', 'bk_warnJS', str_BackupJS, str_BackupJSWarn);
		box.appendChild(jsElems[0]);
		box.appendChild(jsElems[1]);

		// Log checkbox
		var logElems = makeOptRow('bk_cbLog', 'bk_warnLog', str_BackupLogs, str_BackupLogsWarn);
		box.appendChild(logElems[0]);
		box.appendChild(logElems[1]);

		// Jelszó megjegyzés
		var pwdNote = document.createElement('div');
		pwdNote.style.cssText = 'color:#c80;font-size:12px;margin-top:8px;';
		pwdNote.textContent = str_BackupPwdWarn;
		box.appendChild(pwdNote);

		// Progress bar
		var progressEl = document.createElement('progress');
		progressEl.id = 'bk_progress'; progressEl.value = 0; progressEl.max = 100;
		progressEl.style.cssText = 'width:100%;margin-top:12px;display:none;';
		box.appendChild(progressEl);

		var statusEl = document.createElement('div');
		statusEl.id = 'bk_status';
		statusEl.style.cssText = 'font-size:12px;color:#555;margin-top:4px;min-height:16px;word-break:break-all;';
		box.appendChild(statusEl);

		// Gombok
		var btnRow = document.createElement('div');
		btnRow.style.marginTop = '14px';
		var btnStart = document.createElement('button');
		btnStart.id = 'bk_btnStart';
		btnStart.textContent = str_BackupStart;
		btnStart.addEventListener('click', startBackup);
		var btnCancel = document.createElement('button');
		btnCancel.textContent = str_Cancel;
		btnCancel.style.marginLeft = '8px';
		btnCancel.addEventListener('click', closeModal);
		btnRow.appendChild(btnStart); btnRow.appendChild(btnCancel);
		box.appendChild(btnRow);

		overlay.appendChild(box);
		document.body.appendChild(overlay);
		overlay.addEventListener('click', function (e) {
			if (e.target === overlay) closeModal();
		});

		return overlay;
	}

	window.openBackupModal = function () {
		if (!_modal) _modal = buildModal();
		resetModal();
		_modal.style.display = 'block';
	};
})();
