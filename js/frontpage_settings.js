<!-- Change the text for on/off switches -->
<!-- var txt_on = '<img src=icons/on.png>';-->
<!-- var txt_off = '<img src=icons/off.png>';-->
var txt_on = 'Aan';
var txt_off = 'Uit';
var txt_zonon = 'Uit'; <!-- Dicht -->
var txt_zonoff = 'In'; <!-- Open -->
var txt_zonstopped = 'Gestopt';
var txt_zonstop = '| |';
<!-- var txt_dim_plus = ' + '; -->
<!-- var txt_dim_min = ' - '; -->

<!-- Change the text displayed in PopUps -->
var txt_switch_protected = '\'Schakelaar is beveiligd\'';
var txt_switch_on = '\'Inschakelen\'';
var txt_switch_off = '\'Uitschakelen\'';
var txt_blind_up = '\'Zonnescherm naar boven\'';
var txt_blind_down = '\'Zonnescherm naar beneden\'';
var txt_blind_stop = '\'Zonnescherm stoppen\'';

<!-- Change the timeout of the PopUp -->
var switch_protected_timeout = '1500';
var switch_on_timeout = '1500';
var switch_off_timeout = '1500';
var camera_doorbell_timeout = '15400';

<!-- Value for ZWave dimmer when on-->
var idx_zdimmer = '171';
var z_dimmer = '';
var z_whichdimmer = '';
//var o_dimmer = '80'; //value 80 is for light in garden
//var o_whichdimmer = '';

<!-- Set values so colors can change -->
var temp_freeze = '0';
var temp_freeze_color = ';color:#0090ff;';
var humidity_max = '90';
var humidity_max_color = ';color:#0090ff;';
var CPUmem_max = '95';
var mem_max_color = ';color:red;';
var CPUusage_max = '50';
var cpu_max_color = ';color:red;';
var color_on = ';color:#1B9772;';
var color_off = ';color:#E24E2A;';
var show_sonos_volume = true; <!-- show Sonos volume in desc text -->

<!-- Change idx of special items -->
var idx_CPUmem = '40';
var idx_HDDmem = '0';
var idx_CPUusage = '40';
var idx_CPUtemp = '29';
var idx_ram_usage = '26';
var idx_cpu_usage = '30';
var idx_SunState = '0';
var SunStateCell = '4';
var idx_IsDonker = '0'; <!-- for day night css -->
var idx_WindRichting = '113';
var idx_WindSnelheid = idx_WindRichting;
var idx_Temp_buiten = idx_WindRichting;
var idx_Tempf = '0';
var idx_BewegingF = '0';
var idx_LuxF = '46';
var idx_LuxV = '46';
var idx_ZonV = '0';
var idx_ZonA = '0';
var idx_Barometer = '112';
var idx_Visibility = '114';
var IsNight = 'No';
var idx_IsDarkVariable= '2';
var idx_ChromecastControl= '127';
var idx_ChromecastTitle= '105';
var idx_ChromecastVolume= '104';
var DarkUserVariable = "IsDonker" 
var idx_rainrate = '116'
var idx_rainforecast = '117'

<!-- Text for vdesc -->
var desc_alarm_off = 'Alarm uit';
var desc_alarm_home = 'Alarm aan (thuis)';
var desc_alarm_away = 'Alarm aan (weg)';
var desc_sunrise = 'Zon op';
var desc_sunset = 'Zon onder';
var desc_showsunboth = ''; // used to show sunrise and sunset in vdesc
var txt_sunboth='';
var txt_sunset='Zon onder';
var txt_sunrise='Zon op';
var var_sunrise='';
var var_sunset='';
var desc_protected = '<img src=icons/lock-closed_w.png align=right style="margin:1.5px 3px 0px -10px">'; //shows lock picture if device is protected or when plusmin is 4

<!-- This triggers the camera PopUp when the doorbell is pressed -->
<!-- Text could be 'On', 'Group On' or 'Chime' -->
var doorbell_status = 'On';
var idx_doorbell = '200'; //dummy switch which goes on when doorbell rings, goes off after 10 seconds
var doorbell_cmd = "lightbox_open('camera1', 15400);"

// ############################################################################################################
// #### vvvvv   USER VALUES below vvvvv   #######
// ############################################################################################################

$(document).ready(function() {
	$.roomplan=0;	// define roomplan in Domoticz and create items below.
	$.domoticzurl="http://192.168.1.140:8080";
	//format: idx, value, label, description, lastseen(1 when lastseen is wanted, 2 is only time), plusmin button or protected (0 for empty, 1 for buttons, 2 for volume of Sonos, 4 for protected, 5 for zwave dimmer, 6 for protected when on), [override css], [alarm value]
	$.PageArray = [
		['0','Desc',		'cell1',	'Buiten','0','0'], //Desc means show the sub cells
		[idx_WindRichting,	'Temp',		'cell1a',	'Buiten','1','0'], //Lastseen only from cell_a possible
		[idx_WindRichting,	'Chill',	    'cell1b',	'Buiten','0','0'],
		['0','Desc',		'cell2',	'Wind','0','0'],
		[idx_WindRichting,	'DirectionStr','cell2a',	'Wind richting','0','0'],
		[idx_WindRichting,	'Speed',		'cell2b',	'Wind snelheid','0','0'],
		['0','Status',		'cell4',	'Zon','0','0'],
		['0','Data',		'cell4a',	'Kamer','1','0'],
		['0','Data',		'cell4b',	'Buiten','0','0'],
		['0','Desc',		'cell5',	'Regen','0','0'],
		[idx_rainrate,		'RainRate',		'cell5a',	'Intensiteit','0','0'],
		[idx_rainforecast,	'Rain',		'cell5b',	'Verwacht','0','0'],
		['0','Status',		'cell6',	'Uit/Thuis','0','0'],
		['10','Status',		'cell7',	'Lamp Gang','0','0'],
		['16','Status',		'cell8',	'Eettafel lamp','0','0'],
		['17','Status',		'cell9',	'Lamp Woonkamer','0','0'],
		['19','Status',		'cell10',	'Aquariumlamp','0','0'],
		['22','Data',		'cell11',	'Balkon Muziek','0','0'],
		['11','Status',		'cell12',	'Kapstok lamp','0','0'],
		['33','Temp',		'cell13',	'Temp Woonkamer','0','0'],
		['46','Data',		'cell14',	'Lux Woonkamer','0','0'], 
		['34','Temp',		'cell15',	'Temp Aquarium','0','0'],
		['47','Level',		'cell16',	'Zonnescherm','0','0'],
		['12','Status',		'cell17',	'Lamp Badkamer','0','0'],
		['32','Status',		'cell18',	'Hoeklamp','0','0'],
		['21','Status',		'cell19',	'Woonkamer Muziek','0','0'],
		['20','Status',		'cell20',	'Daglamp aquarium','0','0'], //6 is protected when on
		[idx_ChromecastControl,'Level',	'cell21',	'Play','0','0'],
		['0','Tijd',		'cell22',	'Tijd','0','0'],
		[idx_ChromecastTitle,'Data',	'cell22',	'Text','0','0'],
		[idx_ChromecastVolume,'Level',	'cell23',	'Volume','0','1'],
		['0','SunBoth',		'cell26',	'Dummy cel voor bepaling zon op en zon onder','0','0'],
		['0','Desc',		'cell2_1',	'Barometer + zicht','0','0'],
		[idx_Barometer,		'Barometer',	'cell2_1a',	'Barometer','1','0'],
		[idx_Visibility,	'Visibility','cell2_1b',	'Zicht','0','0'],
		['0','Desc',		'cell2_2',	'Zon','0','0'],
		['120','Data',		'cell2_2a',	'Altitude','1','0'],
		['119','Data',		'cell2_2b',	'Azimuth','1','0'],
		['0','Data',		'cell2_3',	'Camera garage','0','0'],
		['0','Desc',		'cell2_5',	'RPI CPU + HDD','0','0'],
		['0','Data',		'cell2_5a',	'CPU','0','0'],
		['0','Temp',		'cell2_5b',	'Temp','0','0'],
		['0','Desc',		'cell2_4',	'Temp + Lux F','1','0'],
		['0','Data',		'cell2_4a',	'Temperatuur Fibaro','1','0'],
		['0','Data',		'cell2_4b',	'Temperatuur Fibaro','1','0'],
		['48','Data',		'cell2_6',	'Virtual LUX','1','0'],
		['0','Status',		'cell2_7',	'Herstart PI','0','0'],
		['0','Data',		'cell2_8',	'Beamer','0','0'],
		['0','Status',		'cell2_9',	'Led gang','1','0'],
		['0','Data',		'cell2_10',	'Pi Memory','0','0'],
		['30','Data',		'cell2_11',	'Pi CPU','0','0'],
		['26','Data',		'cell2_12',	'Pi memory','0','0'],
		['0','Status',		'cell2_13',	'Garage','1','0'],
		['0','Status',	'cell2_14',	'Telefoon G','1','4'],
		['0','Status',	'cell2_15',	'Telefoon M','1','4'],
		['57','Status',		'cell2_16',	'Tablet','0','0'],
		['89','Status',	'cell2_17',	'Zonnescherm override','0','0'],
		['218','Status',	'cell2_18',	'Raspberry Pi','1','4'],
		['141','Status',	'cell2_19',	'IJskast','1','0'],
		['61','Data',		'cell2_20',	'Reset Tablet','0','0'],
		['182','Data',		'cell2_21',	'Droger - totaal','1','0'], //CounterToday, Usage
		['0','Tijd',		'cell2_22',	'Tijd','0','0'],
		['88','Status',		'cell2_23',	'Vakantie','0','0'],
		['0','ForecastStr','cell2_25',	'Weersvoorspelling (FC)','0','0']
	];
	$.PageArray_Scenes = [
	
	['5','Status',		'cell9',	'Lampen kamer','1','0'],
	//['7','Status',		'cell13',	'Lamp achtertuin','1','0'],

	];

// ############################################################################################################
// #### ^^^^^   USER VALUES above ^^^^^   #######
// ############################################################################################################

RefreshData();
});


