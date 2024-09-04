app
        .factory('rnvBabelthequeService', ['$http', '$sce',function($http, $sce){
            function fetchBabelioData(isbn, type = 'all', page = 1){
                
                // Replace this variable with actual API endpoint.
                let baseUrl = 'https://path/to/babelio.php';
            
                let url = '';

                if (type == 'all') {
                    url = baseUrl + '?type=all&isbn=' + isbn;
                }
                else if (type == 'reviews') {
                    url = baseUrl + '?type=reviews&isbn=' + isbn + '&page=' + page;
                }
                else if (type == 'citations') {
                    url = baseUrl + '?type=citations&isbn=' + isbn + '&page=' + page;
                }
                else {
                    console.log('RNV Babeltheque ERREUR dans fetchBabelioData: paramètre manquant.');
                    return null;
                }
                
                $sce.trustAsResourceUrl(url);

                return $http.get(url)
                    .then(
                        function(response){
                            return response.data;
                        },
                        function(httpError){
                            if (httpError.status === 404)return null;
                            let error = "RNV Babeltheque ERREUR dans fetchBabelioData: callback: " + httpError.status;
                            if (httpError.data && httpError.data.errorMessage) {
                                error += ' - ' + httpError.data.errorMessage;
                            }
                            console.error(error);
                            return null;
                        }
                    );
                }
            return {
                fetchBabelioData : fetchBabelioData
            };
        }])
        .controller('rnvBabelthequeController', ['$scope', '$location', 'rnvBabelthequeService', function ($scope, $location, rnvBabelthequeService) {
        
            var vm = this;
            this.$onInit = function() {
                
                // Only run on results display pages
                if ($location.path().toLowerCase() == '/fulldisplay') {
                    //console.log('RNV Babeltheque INIT');
                    $scope.$watch(
                        function () {
                            if (angular.isDefined(vm.parentCtrl.item)) {
                                // As soon as an item is loaded, watch for changes
                                return vm.parentCtrl.item;
                            }
                            return 0;
                        },
                        function () {
                            // Look for items with ISBNs.
                            // This listener function is called both during initial run and whenever the watched variable changes.
                            if (angular.isDefined(vm.parentCtrl.item.pnx.addata.isbn)){

                                vm.parentCtrl.item.babelthequeActiveIsbn = vm.parentCtrl.item.pnx.addata.isbn[0];
                            
                                // Unless the Babelio data was fetched already, call the API
                                if (!angular.isDefined(vm.parentCtrl.item.babelio)){

                                    rnvBabelthequeService.fetchBabelioData(vm.parentCtrl.item.babelthequeActiveIsbn)
                                    .then((data) => {
                                        try{
                                            if (!data || !data.id_oeuvre)return;
                                            // No data was returned from the API, presumably this title is not in Babelio.
                                            
                                            // Limit the number of items displayed outside of modal window
                                            let displayLimit = 3;
                                        
                                            // Limit the size of user reviews displayed outside of modal window (number of characters)
                                            let maxReviewLength = 500;
                                    
                                            // Trim the list of user reviews and citations to only display the first 3
                                            if (data.critiques_notice) data.critiques_notice = data.critiques_notice.slice(0,displayLimit);
                                            if (data.critiques_presse_affichees) data.critiques_presse_affichees = data.critiques_presse.slice(0,displayLimit);
                                            if (data.citations_notice) data.citations_notice = data.citations_notice.slice(0,displayLimit);
                                    
                                            // Add a toggle value for user reviews
                                            if (data.critiques_notice) data.critiques_notice.forEach((critique) => {
                                                if (critique.texte.length > maxReviewLength){
                                                    critique.toggle = true;
                                                    critique.open = false;
                                                }
                                                else {
                                                    critique.toggle = false;
                                                    critique.open = true;
                                                }
                                                });
                                    
                                            vm.displayLimit = displayLimit;
                                            vm.parentCtrl.item.babelio = data;
                                    
                                        }
                                        catch(e){
                                            console.error("RNV Babeltheque ERREUR lors de l'appel d'API: \n");
                                            console.error(e.message);
                                        }
                                    })
                                }
                            }
                        }
                    );
                }
            }

            // Function to display all reviews
            $scope.babelthequeDisplayReviews = function(pageNr=1) {

                rnvBabelthequeService.fetchBabelioData(vm.parentCtrl.item.babelthequeActiveIsbn,'reviews',pageNr)
                            .then((data) => {
                                try{
                                    if (!data)return;
                                    vm.parentCtrl.item.babelio.critiques_affichees = data.critiques;

                                    vm.parentCtrl.item.babelthequeDisplayReviewsModal = true;
                                    vm.parentCtrl.item.babelthequeDisplayReviewsPage = pageNr;
                                }
                                catch(e){
                                    console.error("RNV Babeltheque ERREUR lors de l'appel d'API: \n");
                                    console.error(e.message);
                                }
                            })


            };

            // Function to display all citations
            $scope.babelthequeDisplayCitations = function(pageNr=1) {

                rnvBabelthequeService.fetchBabelioData(vm.parentCtrl.item.babelthequeActiveIsbn,'citations',pageNr)
                            .then((data) => {
                                try{
                                    if (!data)return;
                                    vm.parentCtrl.item.babelio.citations_affichees = data.citations;

                                    vm.parentCtrl.item.babelthequeDisplayCitationsModal = true;
                                    vm.parentCtrl.item.babelthequeDisplayCitationsPage = pageNr;
                                }
                                catch(e){
                                    console.error("RNV Babeltheque ERREUR lors de l'appel d'API: \n");
                                    console.error(e.message);
                                }
                            })


            };

        }])
        .controller('babelthequeScrollController', ['$scope', '$location', '$anchorScroll', function($scope, $location, $anchorScroll){
            $scope.scrollToBabelMain = function(){
                $anchorScroll('babelio');
            }
            
            // Function to restrict widget fulldisplay pages only
            $scope.displayBabelWidget = function() {
                return $location.path().toLowerCase() == '/fulldisplay';
            };
        }])
        .filter('cleanUrl', function() {
            return function(link) {
                return link.startsWith('http') ? link : 'https://' + link;
            }
        })
        .filter('cleanDate', function($location) {
            var currentLocale = 'fr';
            if (angular.isDefined($location.$$search.lang)) {
                currentLocale = $location.$$search.lang;
            }
            return function(dateString) {
                let dateObj = new Date(dateString);
                return dateObj.toLocaleString(currentLocale, { dateStyle: 'medium' });
            }
        })
        .component('prmActionListAfter', {
            bindings: { parentCtrl: '<' },
            controller: 'rnvBabelthequeController',
            templateUrl: function($location) {
                // Access the locale parameter from current URL
                var currentLocale = 'fr';
                if (angular.isDefined($location.$$search.lang)) {
                    currentLocale = $location.$$search.lang;
                }
                // Construct dynamic template URL based on the current locale
                return '/discovery/custom/' + LOCAL_VID + '/html/babelio/babelio_' + currentLocale + '.html';
            }
        })
        .component('prmSearchResultJournalIndicationLineAfter', {
            bindings: { parentCtrl: '<' },
            controller: 'babelthequeScrollController',
            templateUrl: function($location) {
                // Access the locale parameter from current URL
                var currentLocale = 'fr';
                if (angular.isDefined($location.$$search.lang)) {
                    currentLocale = $location.$$search.lang;
                }
                // Construct dynamic template URL based on the current locale
                return '/discovery/custom/' + LOCAL_VID + '/html/babelio/babelio_note_' + currentLocale + '.html';
            }
        });