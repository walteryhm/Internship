<div id="tabs-upgrade">
	<div class="ui-ns-internal-tab-container">
		<ul class="ui-ns-internal-tab">
			<li><a href="#tabs-upgrade-1" id="html-infinistream" onclick="reloadInfiniGrid($('#infiniUpgradeTable'))"></a></li>
			<li><a href="#tabs-upgrade-2" id="html-decode-pack" onclick="reloadDecodeGrid($('#decodePackageTable'))"></a></li>
            <li><a href="#tabs-upgrade-3" id="html-wizard" ></a></li>
        </ul>
	</div>
	<div id="tabs-upgrade-1">
		<jsp:include page="UpgradeInfiniStreams.html"></jsp:include>
	</div>
	<div id="tabs-upgrade-2">
		<jsp:include page="UpgradeDecodePack.html"></jsp:include>
	</div>
    <div id="tabs-upgrade-3">
    		<jsp:include page="UpgradeWizard.html"></jsp:include>
    </div>

</div>