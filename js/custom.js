(function () {
    "use strict";
    'use strict';

    var app = angular.module('centralCustom', ['angularLoad', 'googleAnalytics', 'wrlcFooter']);

    app.value('wrlcFooterConfig', {
        message: 'This service is provided in partnership with the <a href="https://www.wrlc.org">Washington Research Library Consortium</a>'
    });

    angular.module('illCard', [])
        .component('prmRequestsOverviewAfter', {
            template: `
            <div ng-if="$ctrl.config.signon_url" class="tiles-grid-tile">
                <div class="tile-content layout-column" layout="column">
                    <div class="tile-header layout-column" layout="column">
                        <div style="display:block;" layout="row" layout-align="space-between" class="layout-align-space-between-stretch layout-row">
                            <h2 class="header-link light-text"><span>{{ $ctrl.config.card_title }}</span></h2>
                                <div layout="row" layout-align="start center">
                                    <span ng-bind-html="$ctrl.config.message"></span>
                                </div>
                            <div layout="column" layout-align="center center" layout-padding layout-margin class="layout-margin layout-padding layout-align-center-center layout-column">
                                <a href="{{ $ctrl.config.signon_url }}">{{ $ctrl.config.link_text}}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`,
            controller:
                function illCardController(illCardConfig) {
                    var self = this;
                        self.config = illCardConfig;
                }
        });

    angular.module('wrlcFooter', [])
        .component('prmSilentLoginAfter', {
    	template: `
    	    <div id="wrlc-footer" layout="row" layout-align="center center">
    	        <div ng-bind-html="$ctrl.config.message" id="wrlc-footer-message" layout-align="center center"></div>
    	    </div>
    	`,
	controller:
	    function footerController(wrlcFooterConfig){
		var self = this;
                self.config = wrlcFooterConfig;
            }
    	});


    app.value('analyticsOptions', {
        enabled: true,
        siteId: 'UA-9172733-11',
        defaultTitle: 'WRLC Search'
    });    

    // GA module
    angular.module('googleAnalytics', []);

    angular.module('googleAnalytics').run(function ($rootScope, $interval, analyticsOptions) {
        if(analyticsOptions.hasOwnProperty("enabled") && analyticsOptions.enabled) {
            if(analyticsOptions.hasOwnProperty("siteId") && analyticsOptions.siteId != '') {
                if(typeof ga === 'undefined') {
                    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                    ga('create', analyticsOptions.siteId, {'alwaysSendReferrer': true});
                    ga('set', 'anonymizeIp', true);
                }
            }
            $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
                if(analyticsOptions.hasOwnProperty("defaultTitle")) {
                    var documentTitle = analyticsOptions.defaultTitle;
                    var interval = $interval(function () {
                        if(document.title !== '') documentTitle = document.title;
                        if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1)
                            if (angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).length === 0) return;
                            else documentTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).text();

                        if(typeof ga !== 'undefined') {
                            if(fromState != toState) ga('set', 'referrer', fromState);
                            ga('set', 'location', toState);
                            ga('set', 'title', documentTitle);
                            ga('send', 'pageview');
                        }
                        $interval.cancel(interval);
                    }, 0);
                }
            });
        }
    });

    angular.module('googleAnalytics').value('analyticsOptions', {
        enabled: true,
        siteId: '',
        defaultTitle: ''
    });

    // WRLC announcement banner
    angular
      .module('wrlcAnnounce', ['ngAnimate'])
        .component('prmSearchBarAfter', {
            template: `
                <wrlc-announce ng-show="!$ctrl.dismissed" ng-if="$ctrl.show">
                    <div id="wrlc-announce-banner" class="layout-align-center-center layout-row flex">
                        <prm-icon icon-type="svg" svg-icon-set="action" icon-definition="ic_announcement_24px" id="wrlc-announce-icon"></prm-icon>
                        <span ng-if="$ctrl.link" id="message"><a href="{{$ctrl.link}}">{{ $ctrl.message }}</a></span>
                        <span ng-if="!$ctrl.link" ng-bind-html=$ctrl.message id="message"></span>
                <button id="dismiss-announcement" area-label="dismiss announcement" class="dismiss-alert-button zero-margin md-button md-primoExplore-theme md-ink-ripple button-with-icon" type="button" ng-click="$ctrl.wrDismiss()">
                    <prm-icon icon-type="svg" svg-icon-set="navigation" icon-definition="ic_close_24px" class="material-icons gray"></prm-icon>
            </button>
                    </div>
                </wrlc-announce>
                `,
            controller:
                function announceController(announceConfig, $http) {

                    var self = this;
                    var config = announceConfig;

                    // get show announcement
                    $http.get(config.announceAPI)
                        .then(function(response){
                            // Test if we want to show the banner or not
                            if (config.getShow(response) == "TRUE") {
                                self.show = true;
                            } else {
                                self.show = false;
                            }
                            // get message and link using configured functions
                            self.message = config.getMessage(response);
                            self.link = config.getLink(response);

                        });
                    self.wrDismiss = function() {
                        self.dismissed = true;
                    }
                }

        });

})();
