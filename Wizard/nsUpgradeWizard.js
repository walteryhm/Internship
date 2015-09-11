/**
 * Created with IntelliJ IDEA.
 * User: yuh
 * Date: 7/9/15
 * Time: 3:13 PM
 * To change this template use File | Settings | File Templates.
 */

var WIZARD_UPGRADE_READCONFIG = 600;
var WIZARD_UPGRADE_READTEMPLATE = 601;
var WIZARD_UPGRADE_SELECTHOST = 602;
var WIZARD_UPGRADE_CONFIG = 603;
var WIZARD_UPGRADE_DEPLOY = 604;
var WIZARD_UPGRADE_LOGINVERIFY = 605;
var WIZARD_UPGRADE_VLANIDVERIFY = 606;
var WIZARD_UPGRADE_VDSVLANVERIFY = 607;
var WIZARD_UPGRADE_ADDVSWITCH = 608;
var WIZARD_UPGRADE_TABLEDELETE = 609;
var WIZARD_UPGRADE_ADDVMVDS = 610;
var WIZARD_UPGRADE_ADDRVMVDS = 611;

var rowIndex = 0;
var configInfo;
var doDelete = false;
var isInput1;
var isInput2;
var isInput3;
var maxNics;

function UpgradeWizard(){
    var This = UpgradeDecodePack;
    var grid_id = this.grid_id = This.grid_id;
    var grid = this.grid = This.grid = $("#" + grid_id);

    this.data = null;

   	// Setup non-static access
   	this.getData = This.getData;
    this.resizeContent = This.resizeContent;
   	this.visible = This.visible;

    var username;
    var server;
    var password;
    var authentication;
    var platform;
    var device;
    var hostlist;
    var exist;
    var chooselist;



//LoginScreen


    $("#uploadConfigFile").fileupload({
        dataType: "json",
        url: DMConst.UPLOAD_URL,
        // done: fires after the file has been uploaded through the iframe/upload plugin
        done: function (e, data){
            if (data && data.result && data.result.filename)
            {
                var params = {};
                var filename = data.result.filename;
                platform = $("input[name='platformChoice']:checked").val();
                device = $("input[name='deviceChoice']:checked").val();
                params["filename"] = filename;
                params["platform"] = platform;
                params["device"] = device;
                var request = asUpgrade.createRequest(WIZARD_UPGRADE_READCONFIG, params);
                asUpgrade.submit(request, function(data)
                {
                    if(data.data=="false") alert("you need to upload the right config file");
                    else{
                        if(data.data.indexOf("//")<0) alert(data.data);
                        else{
                            var res = data.data.split("//");
                            document.getElementById("ConfigFile").value = filename.substring(20,filename.length);
                            maxNics = res[0];
                            document.getElementById("Template").value = res[1];
                            server = res[2]
                            document.getElementById("Server").value = server;
                            username = res[3];
                            document.getElementById("Username").value = username;
                            password = res[4];
                            document.getElementById("Password").value = password;
                            if(res[5]=="false"){
                                $("#authentication").hide();
                                authentication = "false";
                            }
                            else authentication = "true";
                        }
                    }
                });
            }
        }
    })
    /*
    $("#uploadTemplateFile").fileupload({
          dataType: "json",
          url: DMConst.UPLOAD_URL,
          // done: fires after the file has been uploaded through the iframe/upload plugin
          done: function (e, data){
              if (data && data.result && data.result.filename)
              {
                  var params = {};
                  var filename = data.result.filename
                  params["filename"] = filename;
                  var request = asUpgrade.createRequest(WIZARD_UPGRADE_READTEMPLATE, params);
                  asUpgrade.submit(request, function(data)
                  {
                    document.getElementById("Template").value = filename.substring(20,filename.length);
                  });
              }
          }
      })
      */
    $("#LoginNext").click(function(){
        var params = {};
        var isVerified = true;
        params["platform"] = platform;
        params["server"] = server;
        params["username"] = username;
        params["password"] = password;
        if(document.getElementById("ConfigFile").value=="") {
            alert("Config File cannot be blank!");
            isVerified = false;
        }
        else if(document.getElementById("Template").value==""){
            alert("Template File cannot be blank!");
            isVerified = false;
        }
        var request = asUpgrade.createRequest(WIZARD_UPGRADE_LOGINVERIFY, params);
        asUpgrade.submit(request, function(data)
        {
            if(document.getElementById("Username").value=="") alert("Username cannot be blank!");
            else if(document.getElementById("Password").value =="") alert("Password cannot be blank!");
            else if(document.getElementById("Username").value != username || document.getElementById("Password").value != password) {
                alert("Username or Password is invalid!");
            }
            else if(data.data=="success" && isVerified){
                params["authentication"] = authentication;
                params["device"] = device;
                var request = asUpgrade.createRequest(WIZARD_UPGRADE_SELECTHOST, params);
                asUpgrade.submit(request, function(data)
                {
                    var selectHostData = [];
                    var list = data.data;
                    exist = list.substring(list.indexOf('(')+1,list.lastIndexOf(')'))
                    var host = list.substring(0,list.indexOf('('));
                    hostlist = host.split("//");
                    for(var i=0; i<hostlist.length-1; i++){
                        var myrow = new Object();
                        myrow.host = hostlist[i];
                        if(exist.indexOf(hostlist[i])>=0){
                            myrow.status = "vASI already deployed";
                        }
                        else myrow.status = "";
                        selectHostData[i] = myrow;
                    }
                    $("#VMwareSelectDialog").dialog("open");
                    $("#VMwareSelectTable").jqGrid("clearGridData");
                    for(var i=0;i<=selectHostData.length;i++){
                        $("#VMwareSelectTable").jqGrid('addRowData',i+1,selectHostData[i]);
                    }
                });
            }
            else if(isVerified) alert(data.data);
        });

    })



    $("#dialog-deployWizard").dialog({
        autoOpen: false,
        closeOnEscape: false,
        position: "center",
        width: 200,
        height: 150,
        resizable:false,
        modal: true,
        title: "Wizard",
        dialogClass: "no-close"
    });

    $("#dlgApplyWInfo").text(i18nApplyGSText);


//VMware Select hosts
    $("#VMwareSelectDialog").dialog({
        height:550,
        autoOpen: false,
        position: "center",
        width: 500,
        resizable:false,
        modal: true,
        buttons:
        [
            {
                text: "Next>>",
                id : "VMwareSelectNext",
                click: function() {
                    var configLeftData = [];
                    var hosts = [];
                    var ids = $("#VMwareSelectTable").jqGrid('getGridParam','selarrrow');
                    ids.sort();
                    for(var i=0; i<ids.length; i++){
                        var rowData = $("#VMwareSelectTable").jqGrid("getRowData",ids[i]);
                        hosts[i] = rowData.host;
                        var myrow = new Object();
                        myrow.hostlists= rowData.host;
                        configLeftData[i] = myrow;
                    }
                    var params = {};
                    hosts = hosts.join("//");
                    params["fqdn"] = server;
                    params["hosts"] = hosts;
                    var request = asUpgrade.createRequest(WIZARD_UPGRADE_CONFIG, params);
                    asUpgrade.submit(request, function(data)
                    {
                        configInfo = data.data;
                        if(configInfo.indexOf("Server")==0 || configInfo.indexOf("!Server")==0){
                            configInfo = configInfo.split("----");
                            var index = configInfo[0].indexOf("!");
                            var type = "";
                            if(index==0){
                                type = "remirror";
                            }
                            UpgradeWizard.doAjax(type,configInfo[0]) ;
                            $("#VMwareConfigDialog").dialog("open");
                            $("#VMwareConfigLeftTable").jqGrid("clearGridData");
                            for(var i=0;i<=configLeftData.length;i++){
                                $("#VMwareConfigLeftTable").jqGrid('addRowData',i+1,configLeftData[i]);
                            }
                        }
                        else alert(configInfo);
                    });


                }
            },
            {
                text: i18nClose,
                id : "VMwareSelectCancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });


    $("#VMwareSelectTable").jqGrid(
    {
        colNames:["Host", "Status"],
        colModel:[
            {name: "host", index: "host", width: 200},
            {name: "status", index: "status", width: 300}
              ],
        datatype: "local",
        gridview: true,
        height: 400,
        loadui: "disable",
        viewrecords: false,
        altRows:true,
        altclass: 'tableAltRow',
        ignoreCase: true,
        multiselect:true
    })



//VMware Config Machine
    $("#VMwareConfigDialog").dialog({
        autoOpen: false,
        position: "center",
        width: 800,
        resizable:false,
        modal: true,
        buttons:
        [
            {
                text: "Next>>",
                id : "VMwareConfigNext",
                click: function() {
                    var checked;
                    if(configInfo[rowIndex].indexOf("!")==0){
                        checked = UpgradeWizard.checkRemirror();
                    }
                    else{
                        checked = UpgradeWizard.checkConfig();
                    }
                    if(checked==true){
                        $( this ).dialog( "close" );
                        $("#VMwareSelectDialog").dialog("close");
                        var params = {};
                        var configData = configInfo.join("----");
                        params["configInfo"] = configData;
                        var request = asUpgrade.createRequest(WIZARD_UPGRADE_DEPLOY, params);
                        $("#dialog-deployWizard").dialog("open");
                        asUpgrade.submit(request, function(data)
                        {
                            $("#dialog-deployWizard").dialog("close");
                            document.getElementById("ConfigFile").value = "";                                $("#Template").attr("value","");
                            document.getElementById("Template").value = "";                                $("#Username").attr("value","");
                            document.getElementById("Server").value = "";
                            document.getElementById("Username").value = "";
                            document.getElementById("Password").value = "";
                            $("#authentication").show();
                            alert(data.data);
                        });
                        //showHideTaskProgress();
                    }
                }
            },
            {
                text: i18nClose,
                id : "VMwareConfigCancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });

    $("#VMwareConfigLeftTable").jqGrid(
    {
        colNames:["HostLists"],
        colModel:[
            {name: "hostlists", index: "hostlists", width: 180}
              ],
        datatype: "local",
        gridview: true,
        height: 350,
        loadui: "disable",
        viewrecords: false,
        altRows:true,
        altclass: 'tableAltRow',
        ignoreCase: true,
        beforeSelectRow: function(rowid){
            if(configInfo[rowIndex].indexOf("!")==0){
                return UpgradeWizard.checkRemirror();
            }
            else{
                return UpgradeWizard.checkConfig();
            }
        },
        onSelectRow: function(rowid)
        {
            doDelete = true;
            rowIndex = rowid-1;
            var index = configInfo[rowIndex].indexOf("!");
            var type = "";
            if(index==0){
                type = "remirror";
            }
            UpgradeWizard.doAjax(type,configInfo[rowIndex]) ;
        }
    })
    .hideCol("cb");

    $("#VMwareConfigLeftUp").nsToolbar()
    .nsToolbar('addButton',{id:"delHost", iconClass:"ui-icon-ns-delete_off", onClick:function()
    {
        UpgradeWizard.hostDelete();
    }})
}




UpgradeWizard.VmwareConfig = function(res){
    var serverName = res.substring(res.indexOf("Server:("),res.indexOf(")"));
    serverName = serverName.substring(8,serverName.length);
    document.getElementById("legendTitle").innerHTML = serverName;
    var MgntNetwork = res.substring(res.indexOf("Management Network:("),res.indexOf(")Monitor vSwitches:("));
    MgntNetwork = MgntNetwork.substring(20,MgntNetwork.length);
    MgntNetwork = MgntNetwork.split("//");
    document.getElementById("ManagementNetwork").innerHTML = "";
    var MgntIndex = res.substring(res.indexOf("MgntIndex:("),res.indexOf(")DatastoreIndex:("));
    MgntIndex = MgntIndex.substring(11,MgntIndex.length);
    for(var i=0; i<MgntNetwork.length-1; i++){
        document.getElementById("ManagementNetwork").options.add(new Option(MgntNetwork[i], i+1));
    }
    if(MgntNetwork.length-1>0){
        document.getElementById("ManagementNetwork").options[MgntIndex].selected="selected";
    }
    var MonitorvSwitch = res.substring(res.indexOf("Monitor vSwitches:("),res.indexOf(")Monitor VMs on VDS:("));
    MonitorvSwitch = MonitorvSwitch.substring(19,MonitorvSwitch.length);
    MonitorvSwitch = MonitorvSwitch.split("//");
    document.getElementById("MonitorvSwitches").innerHTML = "";
    for(var i=0; i<MonitorvSwitch.length-1; i++){
        document.getElementById("MonitorvSwitches").options.add(new Option(MonitorvSwitch[i], i+1));
        document.getElementById("MonitorvSwitches").options[0].selected="selected";
    }
    var MonitorVMVD = res.substring(res.indexOf("Monitor VMs on VDS:("),res.indexOf(")Datastore:("));
    MonitorVMVD = MonitorVMVD.substring(20,MonitorVMVD.length);
    MonitorVMVD = MonitorVMVD.split("//");
    document.getElementById("MonitorVMsonVDS").innerHTML = "";
    for(var i=0; i<MonitorVMVD.length-1; i++){
        document.getElementById("MonitorVMsonVDS").options.add(new Option(MonitorVMVD[i], i+1));
        document.getElementById("MonitorVMsonVDS").options[0].selected="selected";
    }
    var Datastore = res.substring(res.indexOf("Datastore:("),res.indexOf(")vSwitch VLAN ID:("));
    Datastore = Datastore.substring(11,Datastore.length);
    Datastore = Datastore.split("//");
    document.getElementById("Datastore").innerHTML = "";
    var DatastoreIndex = res.substring(res.indexOf("DatastoreIndex:("),res.length-1);
    DatastoreIndex = DatastoreIndex.substring(16,DatastoreIndex.length);
    for(var i=0; i<Datastore.length-1; i++){
        document.getElementById("Datastore").options.add(new Option(Datastore[i], i+1));
    }
    if(Datastore.length-1>0){
        document.getElementById("Datastore").options[DatastoreIndex].selected="selected";
    }
    var VLANID = res.substring(res.indexOf("vSwitch VLAN ID:("),res.indexOf(")VDS VLAN:("));
    VLANID = VLANID.substring(17,VLANID.length);
    document.getElementById("vSwitch_VLAN_ID").value = VLANID;
    var VDSVLAN = res.substring(res.indexOf("VDS VLAN:("),res.indexOf(")table:("));
    VDSVLAN = VDSVLAN.substring(10,VDSVLAN.length);
    document.getElementById("VDS_VLAN").value = VDSVLAN;
}

UpgradeWizard.VmwareRemirror = function(res){
    var serverName = res.substring(res.indexOf("Server:("),res.indexOf(")"));
    serverName = serverName.substring(8,serverName.length);
    document.getElementById("legendTitle2").innerHTML = serverName;
    var vNIC_No = res.substring(res.indexOf("vNIC No:("),res.indexOf(")Monitor VMs on VDS:("));
    vNIC_No = vNIC_No.substring(9,vNIC_No.length);
    vNIC_No = vNIC_No.split("//");
    document.getElementById("vNIC_No").innerHTML = "";
    var vNICIndex = res.substring(res.indexOf("vNICIndex:("),res.indexOf(")MonitorIndex:("));
    vNICIndex = vNICIndex.substring(11,vNICIndex.length);
    for(var i=0; i<vNIC_No.length-1; i++){
        document.getElementById("vNIC_No").options.add(new Option(vNIC_No[i], i+1));
    }
    if(vNIC_No.length-1>0) {
        document.getElementById("vNIC_No").options[vNICIndex].selected="selected";
    }
    var RMonitorVMsonVDS = res.substring(res.indexOf("Monitor VMs on VDS:("),res.indexOf(")VDS VLAN:("));
    RMonitorVMsonVDS = RMonitorVMsonVDS.substring(20,RMonitorVMsonVDS.length);
    RMonitorVMsonVDS = RMonitorVMsonVDS.split("//");
    document.getElementById("RMonitorVMsonVDS").innerHTML = "";
    var MonitorIndex = res.substring(res.indexOf("MonitorIndex:("),res.length-1);
    MonitorIndex = MonitorIndex.substring(14,MonitorIndex.length);
    for(var i=0; i<RMonitorVMsonVDS.length-1; i++){
        document.getElementById("RMonitorVMsonVDS").options.add(new Option(RMonitorVMsonVDS[i], i+1));
    }
    if(RMonitorVMsonVDS.length-1>0){
        document.getElementById("RMonitorVMsonVDS").options[MonitorIndex].selected="selected";
    }
    var RVDS_VLAN = res.substring(res.indexOf("VDS VLAN:("),res.indexOf(")table:("));
    RVDS_VLAN = RVDS_VLAN.substring(10,RVDS_VLAN.length);
    document.getElementById("RVDS_VLAN").value = RVDS_VLAN;
}

UpgradeWizard.configTable = function(res){
    var configRightData = [];
    var table = res.substring(res.indexOf("table:(("),res.indexOf(")MgntIndex:("));
    var MgntIndex = res.substring(res.indexOf("MgntIndex:("),res.indexOf(")DatastoreIndex:("));
    MgntIndex = MgntIndex.substring(11,MgntIndex.length);
    table = table.substring(8,table.length);
    table = table.split(",");
    var firstRow = new Object();
    firstRow.vNICNo = 0;
    firstRow.switchNetwork = document.getElementById("ManagementNetwork").options[MgntIndex].text;
    firstRow.details = "Management Network";
    firstRow.button = "";
    configRightData[0] = firstRow;
    for(var i=0; i<(table.length-1)/3; i++){
        var myrow = new Object();
        myrow.vNICNo = table[3*(i%3)];
        myrow.switchNetwork = table[3*(i%3)+1];
        myrow.details = table[3*(i%3)+2];
        myrow.button = "";
        configRightData[i+1] = myrow;
    }
    $("#VMwareConfigRightTable").jqGrid("clearGridData");
    for(var i=0;i<configRightData.length;i++){
        $("#VMwareConfigRightTable").jqGrid('addRowData',i+1,configRightData[i]);
    }
    UpgradeWizard.addButton();
}

UpgradeWizard.remirrorTable = function(res){
    var configRightData = [];
    var table = res.substring(res.indexOf("table:("),res.indexOf(")vNICIndex:("));
    table = table.substring(7,table.length);
    table = table.split(",");
    for(var i=0; i<Math.floor(table.length/3); i++){
        var myrow = new Object();
        myrow.vNICNo = table[3*(i%3)];
        myrow.switchNetwork = table[3*(i%3)+1];
        myrow.details = table[3*(i%3)+2];
        myrow.button = "";
        configRightData[i+1] = myrow;
    }
    $("#VMwareConfigRightTable").jqGrid("clearGridData");
    for(var i=0;i<configRightData.length;i++){
        $("#VMwareConfigRightTable").jqGrid('addRowData',i+1,configRightData[i]);
    }
    UpgradeWizard.addButtonR();
}

UpgradeWizard.addButton = function(){
    var ids = jQuery("#VMwareConfigRightTable").jqGrid('getDataIDs');
    for (var i = 1; i < ids.length; i++) {
    var rowNum = ids[i];
    var DeleteBtn = "<button style='background-color: #396995; color: white; cursor: pointer; width: 100px;' onclick='UpgradeWizard.tableDelete(\""+rowNum+"\")' >X</button>";
    jQuery("#VMwareConfigRightTable").jqGrid('setRowData', rowNum, {button: DeleteBtn });
    }
}

UpgradeWizard.addButtonR = function(){
    var ids = jQuery("#VMwareConfigRightTable").jqGrid('getDataIDs');
    for (var i = 0; i < ids.length; i++) {
    var rowNum = ids[i];
    var DeleteBtn = "<button style='background-color: #396995; color: white; cursor: pointer; width: 100px;' onclick='UpgradeWizard.tableDelete(\""+rowNum+"\")' >X</button>";
    jQuery("#VMwareConfigRightTable").jqGrid('setRowData', rowNum, {button: DeleteBtn });
    }
}

UpgradeWizard.tableDelete = function(rowNum){
    var params = {};
    if(configInfo[rowIndex].indexOf("!")==0) params["type"] = "remirror";
    else params["type"] = "normal";
    params["index"] = rowIndex;
    params["rowNum"] = jQuery("#VMwareConfigRightTable").jqGrid('getCell',rowNum,'vNICNo');
    var request = asUpgrade.createRequest(WIZARD_UPGRADE_TABLEDELETE, params);
    asUpgrade.submit(request, function(data)
    {
        $("#VMwareConfigRightTable").jqGrid("delRowData", rowNum);
        var MgntIndex = $("#ManagementNetwork").val();
        var DatastoreIndex = $("#Datastore").val();
        if(params["type"]=="normal"){
            UpgradeWizard.updateConfigData(MgntIndex-1,DatastoreIndex-1);
        }
        else UpgradeWizard.updateRemirrorData(MgntIndex-1,DatastoreIndex-1);
    });
}

UpgradeWizard.doAjax = function(type,data){
    var url;
    var MgntIndex;
    var DatastoreIndex;
    var vNICIndex;
    var MonitorIndex;

    if(type=="remirror"){
        url = "VMwareRemirroring.html"
    }
    else url = "VMwareConfig.html"
    $.ajax({
        type : "get",
        async : false,
        url : url,
        timeout:1000,
        success:function(dates){
            $("#VMwareConfigRight").html(dates);//要刷新的div
            $("#VMwareConfigRightTable").jqGrid(
                {
                    colNames:["vNIC No","Switch/Network","Details",""],
                    colModel:[
                        {name: "vNICNo", index: "vNICNo", width: 100},
                        {name: "switchNetwork", index: "switchNetwork", width: 150},
                        {name: "details", index: "details", width: 150},
                        {name: "button", index: "button", width: 100, sortable:false}
                          ],
                    dataType:"local",
                    gridview: true,
                    height: 130,
                    loadui: "disable",
                    viewrecords: false,
                    altRows:true,
                    altclass: 'tableAltRow',
                    ignoreCase: true
                })
                .hideCol("cb");
            if(type=="remirror"){
                UpgradeWizard.VmwareRemirror(data);
                UpgradeWizard.remirrorTable(data);
                $("#addVMSonVDS2").click(function(){
                    var params = {};
                    params["vNIcNo"] = $("#vNIC_No").find("option:selected").text();
                    params["data"] = $("#RMonitorVMsonVDS").find("option:selected").text();
                    params["index"] = rowIndex;
                    var request = asUpgrade.createRequest(WIZARD_UPGRADE_ADDRVMVDS, params);
                    asUpgrade.submit(request, function(data)
                    {
                        if(data.data=="success"){
                            var vNICNo = $("#vNIC_No").find("option:selected").text();
                            var switchNetwork = $("#RMonitorVMsonVDS").find("option:selected").text();
                            switchNetwork = switchNetwork.substring(0,switchNetwork.indexOf("("));
                            var details = document.getElementById("RVDS_VLAN").value
                            var count = $("#VMwareConfigRightTable").getGridParam("reccount");
                            var item = [{vNICNo:vNICNo, switchNetwork:switchNetwork, details:details, button:""}]
                            $("#VMwareConfigRightTable").jqGrid('addRowData',count+1,item);
                            vNICIndex = $("#vNIC_No").val();
                            MonitorIndex = $("#RMonitorVMsonVDS").val();
                            UpgradeWizard.addButtonR();
                            UpgradeWizard.updateRemirrorData(vNICIndex-1,MonitorIndex-1);
                        }
                        else alert(data.data);
                    });
                })
            }
            else {
                UpgradeWizard.VmwareConfig(data);
                UpgradeWizard.configTable(data);
                $("#ManagementNetwork").change(function(){
                    var newData = $("#ManagementNetwork").find("option:selected").text();
                    MgntIndex = $("#ManagementNetwork").val();
                    DatastoreIndex = $("#Datastore").val();
                    $("#VMwareConfigRightTable").jqGrid('setCell',1,1,newData);
                    UpgradeWizard.updateConfigData(MgntIndex-1,DatastoreIndex-1);
                })
                $("#Datastore").change(function(){
                    MgntIndex = $("#ManagementNetwork").val();
                    DatastoreIndex = $("#Datastore").val();
                    UpgradeWizard.updateConfigData(MgntIndex-1,DatastoreIndex-1);
                })
                $("#addvSwitches").click(function(){
                    var params = {};
                    params["data"] = $("#MonitorvSwitches").find("option:selected").text();
                    params["index"] = rowIndex;
                    var request = asUpgrade.createRequest(WIZARD_UPGRADE_ADDVSWITCH, params);
                    asUpgrade.submit(request, function(data)
                    {
                        if(data.data=="success"){
                            var data = $("#MonitorvSwitches").find("option:selected").text();
                            var count = $("#VMwareConfigRightTable").getGridParam("reccount");
                            var item = [{vNICNo:count, switchNetwork:data, details:data, button:""}]
                            $("#VMwareConfigRightTable").jqGrid('addRowData',count+1,item,"last");
                            MgntIndex = $("#ManagementNetwork").val();
                            DatastoreIndex = $("#Datastore").val();
                            UpgradeWizard.addButton();
                            UpgradeWizard.updateConfigData(MgntIndex-1,DatastoreIndex-1);
                        }
                        else alert(data.data);
                    });
                })
                $("#addVMSonVDS").click(function(){
                    var params = {};
                    params["data"] = $("#MonitorVMsonVDS").find("option:selected").text();
                    params["index"] = rowIndex;
                    var request = asUpgrade.createRequest(WIZARD_UPGRADE_ADDVMVDS, params);
                    asUpgrade.submit(request, function(data)
                    {
                        if(data.data=="success"){
                            var data = $("#MonitorVMsonVDS").find("option:selected").text();
                            var count = $("#VMwareConfigRightTable").getGridParam("reccount");
                            var item = [{vNICNo:count, switchNetwork:data, details:data, button:""}]
                            $("#VMwareConfigRightTable").jqGrid('addRowData',count+1,item);
                            MgntIndex = $("#ManagementNetwork").val();
                            DatastoreIndex = $("#Datastore").val();
                            UpgradeWizard.addButton();
                            UpgradeWizard.updateConfigData(MgntIndex-1,DatastoreIndex-1);
                        }
                        else alert(data.data);
                    });
                })
            }
        },
        error: function() {
            alert("false");
        }
    });
}

UpgradeWizard.updateConfigData = function(MgntIndex,DatastoreIndex){
    var table = "";
    var rowIds = $("#VMwareConfigRightTable").jqGrid('getRowData')
    for(var i=1; i<rowIds.length; i++){
        table += rowIds[i].vNICNo + ",";
        table += rowIds[i].switchNetwork + ",";
        table += rowIds[i].details + ",";
    }
    var temp1 = configInfo[rowIndex].substring(0,configInfo[rowIndex].indexOf("vSwitch VLAN ID"));
    var temp2 = "vSwitch VLAN ID:(" + document.getElementById("vSwitch_VLAN_ID").value + ")"
    var temp3 = "VDS VLAN:(" + document.getElementById("VDS_VLAN").value + ")"
    var temp4 = "table:((" + table + "))";
    if(MgntIndex!="same") var temp5 = "MgntIndex:(" + MgntIndex + ")";
    else var temp5 = configInfo[rowIndex].substring(configInfo[rowIndex].indexOf("MgntIndex:("),configInfo[rowIndex].indexOf("DatastoreIndex:("));
    if(DatastoreIndex!="same") var temp6 = "DatastoreIndex:(" + DatastoreIndex + ")"
    else var temp6 = configInfo[rowIndex].substring(configInfo[rowIndex].indexOf("DatastoreIndex:("),configInfo[rowIndex].length);
    configInfo[rowIndex] = temp1 + temp2 + temp3 + temp4 + temp5 + temp6;
}

UpgradeWizard.updateRemirrorData = function(vNICIndex,MonitorIndex){
    var table = "";
    var rowIds = $("#VMwareConfigRightTable").jqGrid('getRowData')
    for(var i=0; i<rowIds.length; i++){
        table += rowIds[i].vNICNo + ",";
        table += rowIds[i].switchNetwork + ",";
        table += rowIds[i].details + ",";
    };
    var temp1 = configInfo[rowIndex].substring(0,configInfo[rowIndex].indexOf("VDS VLAN"));
    var temp2 = "VDS VLAN:(" + document.getElementById("RVDS_VLAN").value + ")"
    var temp3 = "table:(" + table + ")";
    if(vNICIndex!="same") var temp4 = "vNICIndex:(" + vNICIndex + ")";
    else var temp4 = configInfo[rowIndex].substring(configInfo[rowIndex].indexOf("vNICIndex:("),configInfo[rowIndex].indexOf("MonitorIndex:("));
    if(MonitorIndex!="same") var temp5 = "MonitorIndex:(" + MonitorIndex + ")"
    else var temp5 = configInfo[rowIndex].substring(configInfo[rowIndex].indexOf("MonitorIndex:("),configInfo[rowIndex].length);
    configInfo[rowIndex] = temp1 + temp2 + temp3 + temp4 + temp5;
}

UpgradeWizard.hostDelete = function(){
    if(doDelete==true){
        $("#VMwareConfigLeftTable").jqGrid("delRowData", rowIndex+1);
        configInfo[rowIndex] = "";
        var isEmpty = true;
        for(var i=0; i<configInfo.length; i++){
            if(configInfo[i]!=""){
                var index = configInfo[i].indexOf("!");
                var type = "";
                if(index==0){
                    type = "remirror";
                }
                UpgradeWizard.doAjax(type,configInfo[i]) ;
                isEmpty = false;
                break;
            }
        }
        if(isEmpty==true){
            document.getElementById('VMwareConfigRight').innerHTML = "";
        }
        doDelete = false;
    }
}

UpgradeWizard.checkConfigAddButton = function(id){
    var rowIds = $("#VMwareConfigRightTable").jqGrid('getRowData')
    var list = document.getElementById(id).options;
    for(var i=1; i<rowIds.length; i++){
       for(var j=0; j<list.length; j++){
           if(list[j].text==rowIds[i].switchNetwork) {
               return false;
           }
       }
    }
    return true;
}

UpgradeWizard.checkRemirrorAddButton = function(){
    var rowIds = $("#VMwareConfigRightTable").jqGrid('getRowData')
    var selected = $("#vNIC_No").find("option:selected").text();
    for(var i=0; i<rowIds.length; i++){
        if(rowIds[i].vNICNo==selected) return false;
    }
    return true;
}

UpgradeWizard.checkTableEmpty = function(type){
    var isSelected = true;
    var rowNum = $("#VMwareConfigRightTable").getGridParam("reccount");
    var num;
    if(type=="remirror") num = 0;
    else num = 1;
    if(rowNum<=num) {
        isSelected = false;
    }
    return isSelected;
}

UpgradeWizard.checkVLANID = function(){
    var params = {};
    params["VLANID"] = document.getElementById("vSwitch_VLAN_ID").value;
    var request = asUpgrade.createRequest(WIZARD_UPGRADE_VLANIDVERIFY, params);
    asUpgrade.submit(request, function(data)
    {
        var info = data.data;
        if(info=="success") isInput1 = true;
        else{
            isInput1 = false;
        }
    });
}

UpgradeWizard.checkVDSVLAN = function(type){
    var params = {};
    if(type=="remirror") params["VDSVLAN"] = document.getElementById("RVDS_VLAN").value;
    else params["VDSVLAN"] = document.getElementById("VDS_VLAN").value;
    var request = asUpgrade.createRequest(WIZARD_UPGRADE_VDSVLANVERIFY, params);
    asUpgrade.submit(request, function(data)
    {
        var info = data.data;
        if(info=="success"){
            if(type=="remirror") {
                isInput3 = true;
            }
            else isInput2 = true;
        }
        else{
            if(type=="remirror") isInput3 = false;
            else isInput2 = false;
        }
    });
}

UpgradeWizard.checkConfig = function(){
    if(UpgradeWizard.checkTableEmpty("config")){
        if(isInput1==false){
            alert("Value for vSwitch VLAN ID has to be between 0 and 4095, provide valid value");
            return false;
        }
        else if(isInput2==false){
            alert("Invalid value for VDS VLAN, provide valid value");
            return false;
        }
        else return true;
    }
    else {
        alert("please select at least one Monitor network or Monitor VM or PCI Passthrough device") ;
        return false;
    }
}

UpgradeWizard.checkRemirror = function(){
    if(UpgradeWizard.checkTableEmpty("remirror")){
        if(isInput3==false){
            alert("Invalid value for VDS VLAN, provide valid value");
            return false;
        }
        else return true;
    }
    else{
        alert("please select VMs to re-mirror");
        return false;
    }
}



