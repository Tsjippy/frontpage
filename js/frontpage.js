<!-- Javascript for Domoticz frontpage -->

<!-- Main Frontpage fuction -->
function RefreshData(){
	clearInterval($.refreshTimer);
	
	//Find apple webkit version of useragent and set attributes based on that, to use in CSS
	var navU = navigator.userAgent;	
	// Apple webkit
	var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
	var resultAppleWebKitRegEx = regExAppleWebKit.exec(navU);
	var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(navU)[1]));
	var chromecaststate="Stopped"
	var chromecasttitle=""

	var b = document.documentElement;
	b.setAttribute('data-useragent',  navigator.userAgent);
	b.setAttribute('webkit-version', appleWebKitVersion );
	
	//Get values of the uservariables and store them for later use
	var VariablesURL=$.domoticzurl+"/json.htm?type=command&param=getuservariables";
	$.getJSON(VariablesURL,{format: "json"},
		function(data) {
			if (typeof data != 'undefined') {
				$.each(data.result, function(i,item){
					switch(item["Name"]) {
						case DarkUserVariable:
							IsNight = item["Value"];
							//console.log(IsNight);
							break;
					} 
				});
			}
			else {
			//console.log('Undefined');
			}	
		}
	);

	$('#desc_cell'+SunStateCell).html('<div>'+desc_showsunboth+'</div>');
		
	var jurl=$.domoticzurl+"/json.htm?type=devices&plan="+$.roomplan+"&jsoncallback=?";
	//Get all the devices in the roomplan
	$.getJSON(jurl,	{format: "json"},
		function(data) {
			if (typeof data.result != 'undefined') {
				var_sunrise = data.Sunrise;
				var_sunset = data.Sunset;
				//Get the date
				var now = new Date();
				//Get the time in minutes
				var timeinminutes = now.getHours() * 60 + now.getMinutes();
				var sunsetinminutes = parseInt(var_sunset.split(":")[0]*60)+parseInt(var_sunset.split(":")[1]);
				var sunriseinminutes = parseInt(var_sunrise.split(":")[0]*60)+parseInt(var_sunrise.split(":")[1]);

				//Time is between sunset and sunrise
				if (timeinminutes > sunsetinminutes || timeinminutes <= sunriseinminutes) {
					document.getElementById('dark-styles').disabled  = false;				// night
					$('#cell'+SunStateCell).html('<div><img src=icons/sunset.png vspace=35></div>');
				}else{
					document.getElementById('dark-styles').disabled  = true;         // day
					$('#cell'+SunStateCell).html('<div><img src=icons/sunrise.png vspace=35></div>');
				}
				
				$.each(
					data.result, function(i,item){
						//Loop trough all devices in pageArray defined in frontpage_settings.js
						for( var ii = 0, len = $.PageArray.length; ii < len; ii++ ) {
							//Find matching IDX from PageArray and JSON return of Domoticz
							if( $.PageArray[ii][0] === item.idx ) {	// Domoticz idx number
								//Defining variables
								switchclick='';
								var vtype= $.PageArray[ii][1];		// Domoticz type (like Temp, Humidity)
								var vlabel= $.PageArray[ii][2];		// cell number from HTML layout
								var vdesc= $.PageArray[ii][3];		// description
								var lastseen= $.PageArray[ii][4];	// Display lastseen or not
								var vplusmin= $.PageArray[ii][5];	// minplus buttons
								var vattr= $.PageArray[ii][6];		// extra css attributes
								var valarm= $.PageArray[ii][7];		// alarm value to turn text to red
								var vdata= item[vtype];				// current value
								var vstatus= item["Status"];		// current status
								var vls= item["LastUpdate"];		// Last Seen
								var dateString = item["LastUpdate"];	// 'Last Seen' string used to convert into a nicer date/time 
								var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
								var dateArray = reggie.exec(dateString);
								var dateObject = new Date(
									(+dateArray[1]),
									(+dateArray[2])-1, 				// Careful, month starts at 0!
									(+dateArray[3]),
									(+dateArray[4]),
									(+dateArray[5]),
									(+dateArray[6])
								);
								var convStringDate = dateObject.toString ( 'd MMM' );		// the part of the 'Last Seen' that creates the DATE, original dd-MM-yyyy
								var convStringDate = convStringDate.replace('Mar', 'Mrt'); 	// replace some months to NL abbrev
								var convStringDate = convStringDate.replace('May', 'Mei'); 	// replace some months to NL abbrev
								var convStringDate = convStringDate.replace('Oct', 'Okt'); 	// replace some months to NL abbrev
								var convStringTime = dateObject.toString ( 'HH:mm' );		// the part of the 'Last Seen' that creates the TIME
								var thisday = new Date();
								var dd = thisday.getDate().toString();
								var mm = thisday.getMonth()+1;
								var yyyy = thisday.getFullYear();
								if (dd<10) {
									dd='0'+dd
								}
								if (mm<10) {
									mm='0'+mm
								}
								var thisday = yyyy+"-"+mm+"-"+dd;
								var vdimmercurrent = item["LevelInt"];	// What is the dim level int
								var vdimmervalue = item["Level"];		// What is the dim level
								if (typeof vdata == 'undefined') {
									vdata="?!";
									vdata=item.idx;
								}else {
									// remove too much text
									vdata=new String(vdata).split("kWh",1)[0];
									vdata=new String(vdata).split(" Level:",1)[0];
									vdata=new String(vdata).replace("Set","On");
									vdata=new String(vdata).split("m3",1)[0];
									vdata=new String(vdata).replace("true","protected");
									vdate=new String(vls).split(" ",2)[0];
								}
								alarmcss='';
								
								//Check wether we want to add the last seen to the block
								if (lastseen == '1') {
									if (thisday == vdate) {
										$('#ls_'+vlabel).html(convStringTime) 						// Show only the time if last change date = today
									} 				
									else {
										$('#ls_'+vlabel).html(convStringTime+' | '+convStringDate)	// Change this 'Last Seen' into something you like
									}
								}else if (lastseen == '2') {
									$('#ls_'+vlabel).html(convStringTime)							// Show only the time
								}

								//Actions based on vtype							
								if(vtype == 'Level' && item.SwitchType == 'Dimmer') {
									if(vplusmin > 0 && vplusmin !=2 && vplusmin !=4) {
										if (vdata == txt_off) {
											if(vplusmin == 1) { //Normal dimmer
												var hlp = '<span onclick="SwitchToggle('+item.idx+',\'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+ vdata+'</span>';
											} 
											//var plus = "<img src=icons/up_off.png align=right vspace=12 onclick=ChangeStatus('plus',txt_off," + item.idx + ","+ vdimmercurrent+")>"; //align=right replaced by hspace and vspace
											//var min = "<img src=icons/down_off.png align=left vspace=12 onclick=ChangeStatus('min',txt_off," + item.idx + ","+ vdimmercurrent+")>" //allign=left
											var plus = ""; //no buttons when switch is off
											var min = ""; //no buttons when switch is off
										}
										else if(vplusmin !=2 && vplusmin !=4) {
											if (item.MaxDimLevel == 100) {
													//For ZWave dimmer
													if(vplusmin == 5 && item.idx == idx_zdimmer) { //compare idx_zdimmer with z_whichdimmer if there are more zdimmers
														//vdata = z_dimmer;
														vdimmervalue = Math.round(vdimmervalue / 10)*10; //round to ten
														if(z_dimmer == '') {		//when starting the frontpage
															vdata = vdimmervalue;	//show current dim value
														} else if (z_dimmer != vdimmervalue) {						//when dimmer is changed
																vdata = z_dimmer;
																z_dimmer = vdimmervalue;
														} else {
															vdata = z_dimmer;
														}
														var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
														var plus = "<img src=icons/up.png align=right vspace=12 onclick=ZWaveDim('plus'," + vdata + "," + item.idx + ")>";
														var min = "<img src=icons/down.png align=left vspace=12 onclick=ZWaveDim('min'," + vdata + "," + item.idx + ")>";
														//console.log(vdata + " | " + item.idx);
													}
													else if(item.idx == idx_ChromecastVolume){
														vdimmervalue = Math.round(vdimmervalue / 5)*5; //round to ten
														vdata = vdimmervalue; //show current dim value
														var hlp = '';
														var min = "";
														var plus = '<input type="range" min="1" max="100" value="'+vdata+'" id="Volume" oninput=ChangeVolume('+item.idx+')>';
														vdesc=new String(vdesc).replace( vdesc,vdesc + '<span id="VolumePercentage"; style="color:#1B9772;font-size:20px;"> '+(vdata)+'&#37;</span>');
														//console.log(vdata + " | " + item.idx);
													}
													else {
														//vdata = o_dimmer;
														vdimmervalue = Math.round(vdimmervalue / 5)*5; //round to ten
														vdata = vdimmervalue; //show current dim value
														var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
														var plus = "<img src=icons/up2.png align=right vspace=12 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
														var min = "<img src=icons/down3.png align=left vspace=12 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
													}
												} else {
													//vdata2 = vdimmervalue; //used for ChangeStatus
													//vdimmervalue = Math.round(vdimmervalue / 5)*5; //round to ten
													vdata = vdimmervalue; //show current dim value
													var hlp = '<span onclick="SwitchToggle('+item.idx+',\'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+ vdata+'</span>';
													var plus = "<img src=icons/up2.png align=right vspace=12 onclick=ChangeStatus('plus'," + vdata + "," + item.idx + ","+ vdimmercurrent+")>"; //align=right replaced by hspace and vspace
													var min = "<img src=icons/down3.png align=left vspace=12 onclick=ChangeStatus('min'," + vdata + "," + item.idx + ","+ vdimmercurrent+")>" //align=left
												}
										}
									}
									vdata = min.concat(hlp,plus);
									//console.log(vdata);
								}else if(vtype == 'SetPoint' && vplusmin > 0) {//Thermostat
									vdata= item[vtype]; //added to show setpoint in stead on or off
									var hlp = '<span style='+vattr+'>'+ vdata+'</span>';
									var vplusmin05 = '0.5'; //added to set setpoint with 0.5 steps
									var plus = "<img src=icons/up2.png align=right vspace=12 width=30 onclick=ChangeTherm('plus'," +vplusmin05+ "," + item.idx + ","+ vdata+","+ valarm+")>";
									var min = "<img src=icons/down3.png align=left vspace=12 width=30 onclick=ChangeTherm('min'," +vplusmin05+ "," + item.idx + ","+ vdata+","+ valarm+")>";
									//console.log(vdata);
									vdata = min.concat(hlp,plus);
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:0.5em;\'> &#176;C</sup>";
								}else if(vtype == 'Selector') {//Selector Switches
									vdata = item['Level']; //get current level
									var lvlnames = item['LevelNames'].split("|"); //get all levels
									var countlevels = item['LevelNames'].split("|").length-1; //count the number of levels
									var lvlindex;
									if (item['Level'] == '0'){
										lvlindex = 0;
									}
									else {
										var temp = item['Level'] + "";
										lvlindex = temp.slice(0, -1);
									}
									var LevelName = lvlnames[lvlindex];
									if (LevelName == 'Off') {
										LevelName = txt_off;
									}
									if(lvlindex == 0) { //switch is off
										//var hlp = '<span onclick=BlindChangeStatus('plus', vdata, item.idx);lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+ vdata+'</span>';
										//allow button to switch on
										var hlp = '<span onclick="BlindChangeStatus(\'plus\', '+vdata+', '+item.idx+');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"; style='+alarmcss+'>'+LevelName+'</span>';
										var plus = ""; //no up when switch is off
										var min = ""; //no down when switch is off
										//var plus = "<img src=icons/up_off.png align=right vspace=12 width=30 onclick=BlindChangeStatus('plus'," +vdata+ "," + item.idx + ")>";
										//var min = "<img src=icons/down_off.png align=left vspace=12 width=30>";
									}
									else { //switch is on
										if (lvlindex == countlevels) { //max level, don't allow plus button to go to next level which isn't there
											var plus = "<img src=icons/up.png align=right vspace=12 width=30>";
										}
										else {
											var plus = "<img src=icons/up.png align=right vspace=12 width=30 onclick=BlindChangeStatus('plus'," +vdata+ "," + item.idx + ")>";
										}
										var min = "<img src=icons/down.png align=left vspace=12 width=30 onclick=BlindChangeStatus('min'," +vdata+ "," + item.idx + ")>";
										//var hlp = '<span style='+vattr+'>'+LevelName+'</span>';
										//allow button to switch off
										var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_switch_off+')"; style='+alarmcss+'>'+LevelName+'</span>';
									}
									//console.log(vdata);
									vdata = min.concat(hlp,plus);
								}else if((vtype == 'Temp' || vtype == 'Chill') && vdata > -100){				// Adds the Celsius sign after temp
								//	vdata=new String(vdata).replace( vdata,vdata + "&#176;C");
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:0.5em;\'> &#176;C</sup>";
									if(vdata < 0){					// It's cold, font color will change, is not working with variable from frontpage_settings so hardcoded
										alarmcss=temp_freeze_color;
									}
								}else if(vtype == 'Humidity' && vdata > -100){			// Adds % after humidity
								//	vdata=new String(vdata).replace( vdata,vdata + "%");
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> %</sup>";
									if(vdata > humidity_max){
										alarmcss=humidity_max_color;
									}
								}else if(vtype == 'Speed' && vdata > -100){				// Adds the bf sign after temp
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> m/s</sup>";
								}else if(vtype == 'Visibility' && vdata > -100){
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> km</sup>";
								}
								
								//Actions based on vdata
								// create switchable value when item is switch
								if (vdata == 'Off' && vplusmin !=4) {
									switchclick = 'onclick="SwitchToggle('+item.idx+', \'On\')"';
									alarmcss= color_off;
									vdata = txt_off;
								}else if (vdata == 'On' && vplusmin !=4) {
									switchclick = 'onclick="SwitchToggle('+item.idx+', \'Off\')"';
									alarmcss= color_on;
									vdata = txt_on;
								}
								
								//Actions based on SwitchType
								//Make push off button clickable and change picture
								if (item.SwitchType == 'Push Off Button') {
									//Make clickable
									switchclick = 'onclick="SwitchToggle('+item.idx+', \'Off\')"';
									//Add picture
									vdata=new String("<img src=icons/off_button.png>");
								}else if (item.SwitchType == 'Blinds') {
									if(vdata == 'Closed') {
										if(IsNight == 'Yes') {
											var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
										}
										else {
											var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
										}
										var up = '<img src=icons/sun_up_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
										var down = '<img src=icons/sun_down_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
										vdesc = vdesc + " | " + txt_zonon; //Change description text
									}else if (vdata == 'Open') {
										if(IsNight == 'Yes') {
											var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
										}
										else {
											var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
										}
										//var hlp = '<span onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">'+ "||" +'</span>';
										var up = '<img src=icons/sun_up_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
										var down = '<img src=icons/sun_down_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
										vdesc = vdesc + " | " + txt_zonoff; //Change description text
									}else if (vdata == 'Stopped') {
										if(IsNight == 'Yes') {
											var hlp = '<img src=icons/sun_stop_n.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
										}
										else {
											var hlp = '<img src=icons/sun_stop_d.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Stop\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_stop+')">';
										}
										var up = '<img src=icons/sun_up_off.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
										var down = '<img src=icons/sun_down_on.png hspace=15 vspace=10 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
										vdesc = vdesc + " | " + txt_zonstopped; //Change description text
									}
									vdata = down.concat(hlp,up);
									//console.log(vdata);
								}else if (item.SwitchType == 'Blinds Inverted') {
									if(vdata == 'Closed') {
										var down = '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
										var up = '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
									}else if (vdata == 'Open') {
										var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
										var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
									}
									vdata = down.concat(up);
									//console.log(vdata);
								}else if (item.SwitchType == 'Blinds Percentage') {
									if(item.Status == 'Closed') {
										vdata = 0;
										var down 	= '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
										var up 		= '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
									}
									else if (item.Status == 'Open') {
										vdata = 100;
										var down 	= '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
										var up 		= '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
									}
									else {
										var down 	= '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_down+')">';
										var up 		= '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_up+')">';
									}
									var plus = "<img src=icons/up2.png align=right vspace=12 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
									var min = "<img src=icons/down3.png align=left vspace=12 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
									vdesc=new String(vdesc).replace( vdesc,vdesc + "<span style='color:#1B9772;font-size:20px;'> "+(100-vdata)+"&#37;</span>");
									vdata = min.concat(down,up,plus);
								}else if (item.SwitchType == 'Blinds Percentage Inverted') {
									if(item.Status == 'Closed') {
										var down = '<img src='+$.domoticzurl+'/images/blinds48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
										var up = '<img src='+$.domoticzurl+'/images/blindsopen48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
										//var plus = "<img src=icons/up.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
										//var min = "<img src=icons/down.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
									}
									else if (item.Status == 'Open') {
										vdata = 100;
										var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
										var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
										//var plus = "<img src=icons/up.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
										//var min = "<img src=icons/down.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
									}
									else {
										var down = '<img src='+$.domoticzurl+'/images/blinds48.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'Off\');lightbox_open(\'switch\', '+switch_off_timeout+', '+txt_blind_down+')">';
										var up = '<img src='+$.domoticzurl+'/images/blindsopen48sel.png  hspace=1 width=40 onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_blind_up+')">';
										//var plus = "<img src=icons/up.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('plus'," + vdata + "," + item.idx + ")>";
										//var min = "<img src=icons/down.png vspace=12 hspace=4 width=30 onclick=BlindChangeStatus('min'," + vdata + "," + item.idx + ")>";
									}
									vdesc=new String(vdesc).replace( vdesc,vdesc + "<span style='color:#1B9772;font-size:20px;'> "+vdata+"&#37;</span>");
									vdata = min.concat(down,up,plus);
									//console.log(vdata);
								}
	//console.log(vdata);
								//Actions based on item.idx
								if(item.idx == idx_CPUmem || item.idx == idx_cpu_usage || item.idx == idx_HDDmem || item.idx == idx_ram_usage){// rounding the numbers into whole numbers (MEM and CPU usage)
									vdata=new String(vdata).split("%",1)[0];
									vdata=Math.round(vdata);
								}
								
								if(item.idx == idx_CPUmem && vdata > CPUmem_max){
									alarmcss=mem_max_color;							// Memory usage of the RPi is a bit high, font color will change
								}else if(item.idx == idx_CPUusage && vdata > 50){			// CPU usage of the NAS is a bit high, font color will change, is not working with variable from frontpage_settings so hardcoded
									alarmcss=cpu_max_color;
								}
								
								if(item.idx == idx_WindRichting){
									//console.log("Test");
									//console.log(vdata);
									vdata=new String(vdata).replace( "S","Z");
									vdata=new String(vdata).replace( "S","Z");
									vdata=new String(vdata).replace( "E","O");
									vdata=new String(vdata).replace( "E","O");
									//console.log(vdata);
								}

								if((item.idx == idx_CPUusage || item.idx == idx_HDDmem || item.idx == idx_CPUmem || item.idx ==  idx_ram_usage) && vdata > -100){		// Adds % for CPU
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> %</sup>";
								}else if(item.idx == idx_Temp_buiten || item.idx == idx_Tempf){
									vdata=new String(vdata).replace( " C","<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:0.5em;\'> &#176;C</sup>");							
								}else if(item.idx == idx_LuxF  || item.idx == idx_LuxV){
									vdata=new String(vdata).replace( "Lux","<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> lx</sup>");
								}else  if(item.idx == idx_WindSnelheid){
									vdata=new String(vdata).replace( " m/s","<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.6em;\'> m/s</sup>");
								}else if(item.idx == idx_BewegingF && vdata == 'On,'){
									vdata=new String(vdata).replace( ",","");
									vdata=new String(vdata).replace( "On","Aan");
								}else if(item.idx == idx_Barometer && vdata > 100){ // Added > 100 because idx_Barometer is also used for weather prediction, idx=49
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> hPa</sup>";
								}else if(item.idx == idx_Visibility){
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> KM</sup>";
								}else if (item.idx == idx_ZonV && vdata == txt_on){ //txt_on from frontpage settings
								//	vdata=new String(vdata).replace( "On", "Dicht");
									vdata=txt_zonon;
									alarmcss=color_on;
								}else if (item.idx == idx_ZonV && vdata == txt_off){ //txt_off from frontpage settings
								//	vdata=new String(vdata).replace( "Off", "Open");
									vdata=txt_zonoff;
									alarmcss=color_off;
								}else if (item.idx == idx_ZonA && vdata == txt_on){
								//	vdata=new String(vdata).replace( "On", "Dicht");
									vdata=txt_zonon;
									alarmcss=color_on;
								}else if(item.idx == idx_rainrate){
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> mm/h</sup>";
								}else if(item.idx == idx_rainforecast){
									vdata=vdata+"<sup style=\'font-size:40%;vertical-align:center;position:relative;bottom:-0.7em;\'> mm</sup>";
								}else if(item.idx == idx_ChromecastControl){
									//console.log('Chromecast state is '+vdata)
									if (vdata == 30){
										//Make clickable
										switchclick = 'onclick="SwitchDimmer('+item.idx+', '+vlabel+', \'20\')";';
										//Add picture
										vdata=new String("<img  id='ChromecastControl' src=icons/Play.png>");
										vdesc=new String("Play");
										chromecaststate = "Pause";
									}else if (vdata == "Off" || vdata == 40 || vdata == 0){
										//Do not show buttons if nothing playes
										vdata=new String("");
										vdesc=new String("");
										chromecaststate="Stopped"
									}else{
										//Make clickable
										switchclick = 'onclick="SwitchDimmer('+item.idx+', '+vlabel+', \'30\')"';
										//Add picture
										vdata=new String('<img src=icons/Pause.png id="ChromecastControl" style="float:top;"> ');
										vdesc=new String("Pauze");
										chromecaststate = "Play";
									}
								}else if (item.idx == idx_ChromecastVolume) {
									//console.log(chromecaststate);
									if (chromecaststate == "Stopped"){
										//Do not show buttons if nothing playses
										vdata=new String("");
										vdesc=new String("");
									}
								}else if (item.idx == idx_ChromecastTitle) {
									//console.log(vdata);
									chromecasttitle=vdata
								}		
								// if alarm threshold is defined, make value red
								if (vdata == txt_off && vplusmin ==6) { //protect switch when on for vplusmin is 6
									switchclick = 'onclick="SwitchToggle('+item.idx+', \'On\');lightbox_open(\'switch\', '+switch_on_timeout+', '+txt_switch_on+')"';
									alarmcss= color_off;
									//vdata = txt_off;
								}else if (vdata == txt_on && vplusmin ==6) { //protect switch when on for vplusmin is 6
									switchclick = 'onclick="lightbox_open(\'protected\', '+switch_protected_timeout+', '+txt_switch_protected+')"';
									vdesc = vdesc + desc_protected;
									//alarmcss= color_on;
									//vdata = txt_on;
								}
								
								// if extra css attributes. Make switch not switchable when it is protected, just give message
								if (typeof vattr == 'undefined') {
									if (item.Protected == true || vplusmin == 4) {
										vdesc = vdesc + desc_protected;
										$('#'+vlabel).html('<div onClick="lightbox_open(\'protected\', '+switch_protected_timeout+', '+txt_switch_protected+');" style='+alarmcss+'>'+vdata+'</div>');
									}
									else { 
										$('#'+vlabel).html('<div '+switchclick+' style='+alarmcss+'>'+vdata+'</div>');
									}
								}else if (item.Protected == true || vplusmin == 4) {
									//vdesc = "<img scr=icons/lock-closed_w.png align='left'>" + vdesc;
									vdesc = vdesc + desc_protected;
									$('#'+vlabel).html( '<div onClick="lightbox_open(\'protected\', '+switch_protected_timeout+ ', '+txt_switch_protected+');" style='+vattr+alarmcss+'>'+vdata+'</div>');
								}else {
									$('#'+vlabel).html( '<div '+switchclick+' style='+vattr+alarmcss+'>'+vdata+'</div>');
								}
								//einde nieuw						
								$('#desc_'+vlabel).html(vdesc);
							}else if ( $.PageArray[ii][1] === 'Link' ) {	//Special number, link in cell (test)
								var vlabel=     $.PageArray[ii][2];		// cell number from HTML layout
								var vdata=      $.PageArray[ii][3];		// description (link in this case
								var vdesc = 	'';
								var valarm=     $.PageArray[ii][7];		// alarm value to turn text to red
								$('#'+vlabel).html( '<div>'+vdata+'</div>');
								$('#desc_'+vlabel).html(vdesc);
							}else if ( $.PageArray[ii][1] === 'Tijd' ) {	//Special nummer, tijd in cell (test)
								var vlabel=     $.PageArray[ii][2];		// cell number from HTML layout
								var vdesc = 	'';
								if (chromecaststate != "Stopped" && chromecaststate != "Pause"){
									var vdata= 'Speelt nu af:<br />'+chromecasttitle;
								}else if (chromecaststate == "Pause") {
									var vdata= 'Gepauzeerd:<br />'+chromecasttitle;
								}else{
									var vdata=      currentTime();			// Get present time
									var vattr=    	$.PageArray[ii][5];		// extra css attributes
									var valarm=     $.PageArray[ii][6];		// alarm value to turn text to red
								}
								$('#'+vlabel).html( '<div style='+vattr+'>'+vdata+'</div>');
								$('#desc_'+vlabel).html(vdesc);	
							}else if ( $.PageArray[ii][1] === 'Desc' ) { // shows vdesc when using splitted cells with divs
								var vlabel=     $.PageArray[ii][2];     // cell number from HTML layout
								var vdesc=      $.PageArray[ii][3];		// show text in bottom
								var lastseen=	$.PageArray[ii][4];		// show last seen
								var vls= 	item["LastUpdate"];			// Last Seen
								$('#desc_'+vlabel).html(vdesc);	
							}else if ( $.PageArray[ii][1] === 'SunRise' ) { 	//Special nummer, zonsop/onder in cell (test)
								var vlabel=     $.PageArray[ii][2];         // cell number from HTML layout
								var vdesc=      '';
								var vattr=      $.PageArray[ii][6];        	// extra css attributes
								var valarm=     $.PageArray[ii][7];        	// alarm value to turn text to red
								$('#'+vlabel).html( '<div style='+vattr+'>'+var_sunrise+'</div>');
								$('#desc_'+vlabel).html(txt_sunrise);
							}else if ( $.PageArray[ii][1] === 'SunSet' ) { 	//Special nummer, zonsop/onder in cell (test)
								var vlabel=     $.PageArray[ii][2];         // cell number from HTML layout
								var vdesc=      '';
								var vattr=      $.PageArray[ii][6];         // extra css attributes
								var valarm=     $.PageArray[ii][7];         // alarm value to turn text to red
								$('#'+vlabel).html( '<div style='+vattr+'>'+var_sunset+'</div>');
								$('#desc_'+vlabel).html(txt_sunset);
							}else if ( $.PageArray[ii][1] === 'SunBoth' ) { 	//Special nummer, zonsop/onder in cell (test)
								//console.log("Sun");
								var vlabel=     $.PageArray[ii][2];         // cell number from HTML layout
								var vdesc=      '';
								var vattr=      $.PageArray[ii][6];         // extra css attributes
								var valarm=     $.PageArray[ii][7];         // alarm value to turn text to red
								$('#'+vlabel).html( '<div style='+vattr+'>&#9650 ' +var_sunrise+' | &#9660 '+var_sunset+'</div>');
								$('#desc_'+vlabel).html(txt_sunboth);
								desc_showsunboth = '&#9650; ' +var_sunrise+' | &#9660; '+var_sunset; // used for cell with time sunrise and sunset including arrow up and arrow down
							}
						}
					}
				);
			}
		}
	);
	$.refreshTimer = setInterval(RefreshData, 8000); //was 8000
	//console.log("Done");
}

//switch state of a switch
function SwitchToggle(idx, switchcmd){
	$.ajax({
		//url: $.domoticzurl+"/json.htm?type=command&param=switchlight" + "&idx=" + idx + "&switchcmd=" + switchcmd + "&level=0",
		url: $.domoticzurl+"/json.htm?type=command&param=switchlight" + "&idx=" + idx + "&switchcmd=" + switchcmd,
		async: false,
		dataType: 'json',
		success: function(){
			console.log('SUCCES');
		},
		error: function(){
			console.log('ERROR');
		}
	});
	RefreshData();
}
	
//switch dimmer and set level
function SwitchDimmer(idx, vlabel,level){
	if (idx == idx_ChromecastControl){
		if (level == 20){
			document.getElementById("ChromecastControl").src = "icons/Play.png";
			document.getElementById("desc_"+vlabel.id).innerHTML="Play"
			cell22.firstChild.firstChild.data="Gepauzeerd:"
		}else{
			document.getElementById("ChromecastControl").src ='icons/Pause.png';
			document.getElementById("desc_"+vlabel.id).innerHTML="Pauze";
			cell22.firstChild.firstChild.data="Speelt nu af:"
		}
	}

	$.ajax({
	url: $.domoticzurl+"/json.htm?type=command&param=switchlight" + "&idx=" + idx + "&switchcmd=Set%20Level" + "&level=" + level,
	async: false,
	dataType: 'json',
	success: function(){
	console.log('SUCCES');
	},
	error: function(){
	console.log('ERROR');
	}
	});
	//RefreshData();
}

function ChangeVolume(idx){
	var slider = document.getElementById("Volume");
	var output = document.getElementById("VolumePercentage");
	output.innerHTML = " "+(slider.value)+'&#37';
	$.ajax({
		url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + slider.value,
		async: false,
		dataType: 'json',
		success: function(){
			console.log('SUCCES');
		},
		error: function(){
			console.log('ERROR');
		}
	});
	//console.log($.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + slider.value);
}

//Dimmer, only works with 1-16 dimmer for now
function ChangeStatus(OpenDicht,level,idx,currentlevel){
	//When switched off return to previous level, no matter if plus or min pressed
	if (level == txt_off) {
		if (currentlevel == 1) {
			currentlevel++;
		}
		//console.log("In uit",currentlevel);
		$.ajax({
		url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + currentlevel,
		async: false,
		dataType: 'json',
		success: function(){
		console.log('SUCCES');
		},
		error: function(){
		console.log('ERROR');
		}
		});
	}
	else {
		level = level * 1;
		//console.log(OpenDicht,level);
		if (OpenDicht == "plus")
			{
			var d = ((level + 10)/100 * 16) +  0.5;
			//console.log("in plus",d,level);
			if(d > 16) {
				d = 16;
			}
			$.ajax({
			url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
			async: false,
			dataType: 'json',
			success: function(){
			console.log('SUCCES');
			},
			error: function(){
			console.log('ERROR');
			}
			});
		}
		else {
			var d = ((level-0.1 )/100*16)  ;
			//console.log("in min",d,level);
			if( d < 0 ){
				d = 0;
			}
			$.ajax({
			url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
			async: false,
			dataType: 'json',
			success: function(){
			console.log('SUCCES');
			},
			error: function(){
			console.log('ERROR');
			}
			});
		}
	}
	RefreshData();
	}

// zwave dimmer
function ZWaveDim(OpenDicht,level,idx){
        if (OpenDicht == "plus"){
                //var d = 0;
				var d = level + 10;
                if(d > 100) {
					d = 100;
                }
                $.ajax({
                        url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
                        async: false,
                        dataType: 'json',
                        success: function(){
                                console.log('SUCCES');
								//console.log('level oud: ' + level);
								//console.log('level nieuw: ' + d);
								//console.log('idx: ' + idx);
								z_dimmer = d; //To show new value for ZWave dimmer
								z_whichdimmer = idx; //Only show new value for dimmer which was pressed
								//console.log('waarde: ' + z_dimmer);
								//console.log('idx: ' + z_whichdimmer);
                        },
                        error: function(){
                                console.log('ERROR');
                        }
                });
          }else{
                
				//var d = 0;
				var d = level - 10;
				//console.log("in min",d,level);
				if( d < 0 ){
					d = 0;
				}
                $.ajax({
                        url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
                        async: false,
                        dataType: 'json',
                        success: function(){
                                console.log('SUCCES');
								//console.log('level oud: ' + level);
								//console.log('level nieuw: ' + d);
								//console.log('idx: ' + idx);
								z_dimmer = d; //To show new value for ZWave dimmer
								z_whichdimmer = idx; //Only show new value for dimmer which was pressed
								//console.log('waarde: ' + z_dimmer);
								//console.log('idx: ' + z_whichdimmer);
                        },
                        error: function(){
                                console.log('ERROR');
                        }
                });
          }      
RefreshData();
}
	
// blinds percentage
function BlindChangeStatus(OpenDicht,level,idx){
	if (OpenDicht == "plus"){
		var d = level + 5;
		if(d > 100) {
			d = 100;
		}
		$.ajax({
			url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
			async: false,
			dataType: 'json',
			success: function(){
				console.log('SUCCES');
			},
			error: function(){
				console.log('ERROR');
			}
		});
	}else{
		var d = level - 5;
		if( d < 0 ){
			d = 0;
		}
		$.ajax({
			url: $.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d,
			async: false,
			dataType: 'json',
			success: function(){
				console.log('SUCCES');
			},
			error: function(){
				console.log('ERROR');
			}
		});
	}
	console.log($.domoticzurl+"/json.htm?type=command&param=switchlight&idx=" + idx + "&switchcmd=Set Level&level=" + d)        
	RefreshData();
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

//Thermostat
function ChangeTherm(dimtype,stepsize,idx,currentvalue,thermmax){
		newvalue='';
		//console.log(dimtype,stepsize,idx,currentvalue,thermmax)
		if (dimtype == 'plus') { 
			if ((currentvalue + stepsize) > thermmax){
				newvalue = thermmax;
			} else {
				newvalue = currentvalue + stepsize;
			}
		}
		else if (dimtype == 'min'){ 
			if (currentvalue < stepsize){
				newvalue = 1;
			} else {
				newvalue = currentvalue - stepsize;
			}
		}
		$.ajax({
			url: $.domoticzurl+"/json.htm?type=command&param=udevice" + "&idx=" + idx + "&nvalue=0&svalue=" + newvalue,
			async: false, 
			dataType: 'json',
			success: function(){
				console.log('SUCCES');
			},
			error: function(){
				console.log('ERROR');
			}	
		});
 	RefreshData();
}

//Return current time: dd-mm-yyyy hh:mm
function currentTime() {
    var today=new Date();
    var h=today.getHours().toString();
    h = h.trim();
    if (h.length == 1) { 
		h = '0'+ h;
    }
    var m=today.getMinutes().toString();
    m = m.trim();
    if (m.length == 1) { 
		m = '0'+ m;
    }
	var s=today.getSeconds().toString();
	s = s.trim();
	if (s.length == 1) {
		s = '0'+ s;
	}
    
    var day=today.getDate().toString();
    day = day.trim();
   
   //Change the day to reflect your preferred translation
   var day = new Array();
      day[0] = "Zondag";
      day[1] = "Maandag";
      day[2] = "Dinsdag";
      day[3] = "Woensdag";
      day[4] = "Donderdag";
      day[5] = "Vrijdag";
      day[6] = "Zaterdag";
   var day = day[today.getDay()];
   
   //haal datum op
   var datum=today.getDate().toString();
   datum=datum.trim();
   
   //haal maand op
   var month = new Array();
     month[0] = "januari";
     month[1] = "februari";
     month[2] = "maart";
     month[3] = "april";
     month[4] = "mei";
     month[5] = "juni";
     month[6] = "juli";
     month[7] = "augustus";
     month[8] = "september";
     month[9] = "oktober";
     month[10] = "november";
     month[11] = "december";
   var month = month[today.getMonth()];
   
   //haal jaar op
   var year = today.getFullYear();
   
   var ret_str=day+" "+datum+" "+month+" "+year+" <br /> "+h+":"+m+"";
   return ret_str;
}


<!-- Create popup -->
function lightbox_open(id, timeout, txt){
	window.scrollTo(0,0);
	if (typeof txt != 'undefined') {
		$('#popup_'+id).html('<div>'+txt+'</div>'); }
	$('#popup_'+id).fadeIn('fast');
	$('#fade').fadeIn('fast');
	return setTimeout(function() {
	lightbox_close(id);
	}, timeout);
}

<!-- Close popup -->
function lightbox_close(id){
	$('#popup_'+id).fadeOut('fast');
	$('#fade').fadeOut('fast');
}
