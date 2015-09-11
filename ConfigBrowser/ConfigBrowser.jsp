<%@ page import="java.io.DataOutputStream,
                 java.io.FileOutputStream,
                 com.netscout.frameworks.common.Response,
                 com.netscout.frameworks.datamodel.*,
                 com.netscout.frameworks.common.SingleResponse,
                 com.netscout.frameworks.dbx.*,
                 com.netscout.frameworks.util.*,
                 org.w3c.dom.Document,
                 org.w3c.dom.Element,
                 org.w3c.dom.Node,
                 org.w3c.dom.NodeList,
                 javax.xml.parsers.DocumentBuilder,
                 javax.xml.parsers.DocumentBuilderFactory,
                 java.io.File,
                 java.util.ArrayList,
                 java.io.FilenameFilter,
                 java.util.*" %>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<%@ include file="version.jsp" %>
<head>
    <title>ConfigBrowser</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <link rel="stylesheet" href="styles/ConfigBrowser.css">
    <link rel="stylesheet" type="text/css" media="screen" charset="utf-8"
          href="/styles/theme_1_10_3/jquery-ui-1.10.3.css?ver=<%=qBuildNum%>"/>
    <link rel="stylesheet" type="text/css" media="screen" charset="utf-8"
          href="/3rdparty/jqgrid/4.6.0/css/ui.jqgrid.css?ver=<%=qBuildNum%>"/>
    <link rel="stylesheet" type="text/css" media="screen" charset="utf-8"
          href="/common/styles/nsCommon.css?ver=<%=qBuildNum%>"/>


    <script src="/common/scripts/locales/common-en_US.js?ver=<%=qBuildNum%>"></script>
    <script src="/scripts/jquery-2.0.3.js?ver=<%=qBuildNum%>"></script>
    <script src="/scripts/jquery-ui-1.10.3.js?ver=<%=qBuildNum%>"></script>
    <script src="/3rdparty/jqgrid/4.6.0/js/i18n/grid.locale-en.js?ver=<%=qBuildNum%>"></script>
    <script src="/3rdparty/jqgrid/4.6.0/js/jquery.jqGrid.src.js?ver=<%=qBuildNum%>"></script>
    <script src="/common/scripts/nsJQGridViewHandler.js?ver=<%=qBuildNum%>"></script>
    <script src="/common/scripts/jqGridFormatters.js?ver=<%=qBuildNum%>"></script>
    <script src="/common/scripts/jqGridCustomOverlay.js?ver=<%=qBuildNum%>"></script>




    <script type="text/javascript">
        function select() {
            <%
            long time = new Date().getTime();
            %>
            var list = document.getElementById("dropdownlist");
            var index = list.selectedIndex;
            var name = list.options[index].text;
            document.getElementById("table_name").value = name;
            document.getElementById("myForm").submit();

        }


    </script>


</head>
<body>
<%

    ArrayList file = new ArrayList();
    file.add("");
    Element element = null;
    String appRoot = System.getProperty("app.root");
    String separator = System.getProperty("file.separator");
    String filename = "Configs.xml";
    File f = new File(appRoot + separator + "tomcat" + separator + "content" + separator + "webapps" + separator + "devicemgmt" + separator + "configdata" + separator + filename);
    DocumentBuilder db = null;
    DocumentBuilderFactory dbf = null;
    try {
        dbf = DocumentBuilderFactory.newInstance();
        db = dbf.newDocumentBuilder();
        Document dom = db.parse(f);
        element = dom.getDocumentElement();
        NodeList childnodes = element.getChildNodes();

        for (int i = 0; i < childnodes.getLength(); i++) {

            Node node = childnodes.item(i);
            if (("Component").equals(node.getNodeName())) {

                file.add(node.getAttributes().getNamedItem("name").getNodeValue());
            }
        }

    } catch (Exception e) {
        e.printStackTrace();
        System.out.print("333333");
    }


    Collections.sort(file);

    String tableName = "";
    if ((String) request.getParameter("table_name") != null) {
        tableName = (String) request.getParameter("table_name");
    }

    ArrayList<NSColumn> list = new ArrayList();
    ArrayList<ArrayList> res = new ArrayList<ArrayList>();
    if (tableName != null && tableName != "") {
        TableReplicator tr = new TableReplicator();
        NSGrid tableDate = tr.exportTable(tableName);
        list = tableDate.getMetaData();
        res = new ArrayList<ArrayList>();
        for (int i = 0; i < tableDate.size(); i++) {
            ArrayList row = new ArrayList();

            for (int j = 0; j < list.size(); j++) {

                String name = list.get(j).getColumnName();
                if (!tableDate.isNull(j, i)) row.add(tableDate.get(name, i));
                else row.add("null");
            }
            res.add(row);
        }
    }


%>


<script type="text/javascript">
    $(document).ready(function () {


        var colNames = [];
        var colModel = [];
        <%
        for(int j=0; j<list.size(); j++){
        %>
        colNames[<%=j%>] = "<%=list.get(j).getColumnName()%>";
        var num = <%=res.size()%> ;
        var temp = "<%=res.size()>0 ? res.get(0).get(j):0%>";
        var len = <%=list.size()%>;
        var width;
        if (len <= 4) {
            width = 800 / len;
        }
        else width = 200;
        if (isNaN(temp)) {
            colModel[<%=j%>] = {name:"<%=list.get(j).getColumnName()%>", index:"<%=list.get(j).getColumnName()%>", width:width};
        }
        else {
            colModel[<%=j%>] = {name:"<%=list.get(j).getColumnName()%>", index:"<%=list.get(j).getColumnName()%>", sorttype:"int", width:width};
        }
        <%
        }
        %>

        var mydata = [];

               <%
               for(int i=0; i<res.size(); i++){
               %>
               var myrow = new Object();
               <%
                   for(int j=0; j<res.get(0).size(); j++){
               %>

               myrow.<%=list.get(j).getColumnName()%> = "<%=res.get(i).get(j)%>";

               <%
                   }
               %>

               mydata[<%=i%>] = myrow;

               <%
               }
               %>

        $("#showResult").GridUnload();
        $("#showResult").jqGrid({
            colNames:colNames,
            colModel:colModel,
            data: mydata,
            datatype:"local",
            gridview:true,
            headertitles:true,
            height:350,
            loadui:"disable",
            multiselect:true,
            sortname:"name",
            viewrecords:true,
            ignoreCase:true,
            loadonce:true,
            rowNum: num
        })
                .hideCol("cb");
                jQuery("#showResult").jqGrid('navGrid', '#ptoolbar', {del:false, add:false, edit:false, search:false});
                jQuery("#showResult").jqGrid('filterToolbar', {stringResult:true, searchOnEnter:false})[0].toggleToolbar();
    })
</script>
<script type="text/javascript">
    function control() {
        $("#showResult")[0].toggleToolbar();
    }
</script>


<div id="main_div">
    <div class="header">
        <p class="title">Configuration Browser</p>
    </div>

    <div class="section1">
        <form id="myForm" method="post" action="/devicemgmt/ConfigBrowser.jsp">
            <input type="hidden" id="table_name" name="table_name" value=""/>

            <p class="table_name">Table Name:</p>
            <select id="dropdownlist" name="dropdownlist" value="dropdownlist">
                <%

                    for (int i = 0; i < file.size(); i++) {
                        if (tableName.equals(file.get(i))) {
                %>
                <option selected="selected"><%=file.get(i) %>
                </option>

                <%
                } else {
                %>
                <option><%=file.get(i) %>
                </option>

                <%
                        }
                    }
                %>
            </select>
            <button class="view" onclick="select()">view</button>
    </div>
    </form>
    <div class="section2">
        <p class="table_content">Table Content:</p>

        <%

            if (tableName != null && !tableName.equals("")) {
        %>
        <button class="view" onclick="control()">filter</button>
        <%
            }
            if (tableName != null && !tableName.equals("")) {
        %>
        <div class="table">

            <table id="showResult"></table>
            <div id="ptoolbar" ></div>

        </div>
        <%
        } else {
        %>

        <%
            }
        %>
    </div>
        <%
    if(tableName!=null && !tableName.equals("")){
    %>

    <div class="section3">
        <%

            long timeNow = new Date().getTime();
            long currentTime = timeNow - time;

        %>
        <p style="float: right; width: 50px;" align="right"><%=res.size() %></p> <p style="float: right; width: 120px" align="left">Records Fetched:</p>
        </br>

        <p style="float: right; width: 50px; margin-right: -170px;" align="right"><%=currentTime%> ms</p> <p style="float: right; width: 120px; margin-right: -120px;" align="left">Time Taken:</p>

    </div>
        <%
    }
    %>


</body>
</html>

