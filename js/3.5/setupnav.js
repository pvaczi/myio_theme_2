document.write('<body><div id="overlay"></div><div class="header">');
document.write('<form method="POST" id="form">');
document.write('<input type=hidden name=X id=X value=0>');
document.write('<input type=hidden name=Y id=Y value=0>');
document.write('<input type=hidden name=sending id=sending value=0></form>');
document.write('<form method="POST" id="form2">');
document.write('<input type=hidden name=X id=X value=0>');
document.write('<input type=hidden name=Y id=Y value=0>');
document.write('<input type=hidden name=username id=username value=0>');
document.write('<input type=hidden name=password id=password value=0></form>');

document.write('<form method="POST" id="form3">');
document.write('<input type=hidden name=X id=X value=0>');
document.write('<input type=hidden name=Y id=Y value=0>');
document.write('<input type=hidden name=t_id id=id value=0>');
document.write('<input type=hidden name=t_sunset id=sunset value=0>');
document.write('<input type=hidden name=t_sunrise id=sunrise value=0>');
document.write('<input type=hidden name=t_month id=month value="-">');
document.write('<input type=hidden name=t_day id=day value="-">');
document.write('<input type=hidden name=t_hour id=hour value=0>');
document.write('<input type=hidden name=t_minute id=minute value=0>');
document.write('<input type=hidden name=t_days id=days value=0>');
document.write('<input type=hidden name=t_event id=timerEvent value="-">');
document.write('<input type=hidden name=t_eventParam id=timerEventParam value="-"></form>');
	
document.write('<table id=t_navbar>');
document.write('<tr id=navbartop><td align=center style=width:10%;>');
document.write('<div id=AutoRefresh style=display:inline-block>');
document.write('<input type=checkbox name=cb_AutoRefresh id=cb_AutoRefresh checked="" onClick=toggleButton("AutoRefresh",0,0)>');
document.write('<label><script>document.write(str_Auto_Refresh);</script></label></div>');
document.write('<button name=Refresh onClick=sendForm() ><script>document.write(str_Update);</script></button></td>');
document.write('<td align=center style=width:7%;>');
document.write('<div id=Booster style=display:inline-block>');
document.write('<input type=checkbox name=cb_Booster id=cb_Booster checked="" onClick=toggleButton("Booster",0,1)>');
if (Host!="") {
	document.write('<button onClick=ShowBoosterText()>' + str_Booster + '</button>');
} else {
	document.write('<label>' + str_Booster + '</label>');
}
document.write('</div></td><td align=center style=width:60%;>');
var tempString="'/'";
document.write('<button name=Exit onClick=window.location.href='+tempString+' >'+str_Home+'</button>');
document.write('&nbsp;&nbsp;');
tempString="'/setup'";
document.write('<button name=Global onClick=window.location.href='+tempString+'>'+str_General+'</button>');
tempString="'/output'";
document.write('<button name=Output onClick=window.location.href=' + tempString + '>' + str_Output + '</button>');
tempString="'/pcaout'";
document.write('<button name=Output onClick=window.location.href=' + tempString + '>' + str_PCA_Output + '</button>');
tempString="'/input'";
document.write('<button name=Input onClick=window.location.href='+tempString+'>'+str_Input+'</button>');        
tempString="'/groups'";
document.write('<button name=Input onClick=window.location.href='+tempString+'>'+str_Groups+'</button>');        
tempString="'/users'";
document.write('<button name=Users onClick=window.location.href=' + tempString + '>' + str_Users + '</button>');
tempString="'/timer'";
document.write('<button name=Timer onClick=window.location.href=' + tempString + '>' + str_Timer + '</button>');
if (VersionCheck("3.6")) {
	tempString="'/dict'";
	document.write('<button name=Dict onClick=window.location.href=' + tempString + '>' + str_Dict + '</button>');
}
if (VersionCheck("3.7.1")) {
	tempString="'/emanager'";
	document.write('<button name=Eman onClick=window.location.href=' + tempString + '>' + str_Emanager + '</button>');
}
tempString="'/evlog'";
document.write('<button name=Log onClick=window.location.href=' + tempString + '>' + str_Log + '</button>');
document.write('<button name=Backup onClick=openBackupModal()>' + str_Backup + '</button>');
document.write('</td><td align=center style=width:15%;>');
if (window.location.pathname != "/dict") {
	tempString="window.location.href='/save'";
} else {
	tempString='SaveJSNs();'
}
document.write('<button name=Save onClick=' + tempString + '>' + str_Save + '</button>');
if (window.location.pathname != "/dict") {
	tempString = "'/load'";
	document.write('<button name=Load onClick=window.location.href=' + tempString + '>' + str_Load + '</button>');
}
document.write('</td></tr><tr><td align=center id=navbar2nd>');
document.write('<div id=SuperVisor style=display:inline-block>');
tempString="'SuperVisor'";
document.write('<input type=checkbox name=cb_SuperVisor id=cb_SuperVisor checked="" onClick="toggleButton('+tempString+',0,1)">');
document.write('<label>' + str_SuperVisor + '</label></div></td><td align=center id=navbar2nd>');
document.write('<div id=BoosterText >');
	
document.write('<input type = "text" size = "15" maxlength = "50" name = "Host" value = "' + Host + '" onchange = "setCookie(this.name,this.value);" > ');
if (langJSON.languages != undefined) {
	document.write('<select id="Language" name="Language" onchange=setCookie("Language",this.value);sendForm(); >');
	for (j in langJSON.languages) {
		document.write('<option value="' + j + '"');
		if (j == language) { document.write(' selected'); }
		document.write('>' + str_language[j]);
		document.write('</option>');
	}
	document.write('</select>');
}
document.write('</div></td><td align=center ');
if (message.length>0){
	document.writeln('id="messageBoxOn">');
}else {
	document.writeln('id=messageBoxOff>');
}
document.writeln(message);
document.writeln('</td><td id="saveImmediately" align=center >'); 
SaveImmediately=document.getElementById("saveImmediately");
if(window.location.pathname == "/output"
	|| window.location.pathname == "/input"
	|| window.location.pathname == "/setup"
	|| window.location.pathname == "/groups"
	|| window.location.pathname == "/emanager"
	|| window.location.pathname == "/pcaout"){
		hideSave();
}else if(window.location.pathname == "/computherm" || window.location.pathname == "/broadlink"){broadlinkSave();}

document.write('</td></tr></table></div>');
var cb_AutoRefresh=true;
if(getCookie("AutoRefresh")=='0'){
	document.getElementById("cb_AutoRefresh").checked = false;
	cb_AutoRefresh=false;
}
if(getCookie("Booster")=='1'){
	document.getElementById("cb_Booster").checked = true;
} else {
	document.getElementById("cb_Booster").checked = false;
}
Cb_SuperVisor=document.getElementById("cb_SuperVisor");
if(getCookie("SuperVisor")=='1'){
	Cb_SuperVisor.checked = true;
	cb_SuperVisor=true;
}else{
	Cb_SuperVisor.checked = false;
	cb_SuperVisor=false;
}
AutoRefresh=document.getElementById("AutoRefresh");
if (window.location.pathname == "/output"
	|| window.location.pathname == "/input"
	|| window.location.pathname == "/userpermissions"
	|| window.location.pathname == "/setup"
	|| window.location.pathname == "/groups"
	|| window.location.pathname == "/emanager"
	|| window.location.pathname == "/pcaout"
	|| 1	)
{
	AutoRefresh.style.display = "inline-block";
} else {
	AutoRefresh.style.display = "none";
	document.getElementById("SuperVisor").style.display = "none";
}
document.getElementById("BoosterText").style.display = "none";
window.addEventListener("load", function(){
    window.scrollTo(x, y);
});

(function () {
	var s = document.createElement('script');
	s.src = host + 'backup.js';
	document.head.appendChild(s);
})();