angular.module('app', ['ngTouch']);
var cache = window.localStorage ? window.localStorage : {};
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

$(document).ready(function (e) {
	document.getElementById("control-panel").style.display = "block";
});

var app = angular.module('app', []);

app.directive('uiColorpicker', function() {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: false,
        replace: true,
        template: "<span><input class='input-small' /></span>",
        link: function(scope, element, attrs, ngModel) {
            var input = element.find('input');
            var options = angular.extend({
                color: ngModel.$viewValue,
                move: function(color) {
                    scope.$apply(function() {
                      ngModel.$setViewValue(color.toHexString());
                    });

					scope.$parent.changeColor(scope.$index);
                },
                clickoutFiresChange: true
            }, scope.$eval(attrs.options));
            
            ngModel.$render = function() {
              input.spectrum('set', ngModel.$viewValue || '');
            };
            
            input.spectrum(options);
        }
    };
});

app.controller('ColorCtrl', function($scope) {
	// display options
	$scope.display = "block";	
	$scope.isVisible = true;
	$scope.isBack = false;
	
	$scope.init = function() {
		// check for saved image;
		if ( cache["savedImage"] &&
			 cache["savedImage"].length > 0 ) {
			var options = JSON.parse(cache["savedImage"]);
			$scope.gradientDirection = options.gradientDirection;
			$scope.isPercentage = options.isPercentage;
			$scope.isRepeating = options.isRepeating;
			$scope.isRadial = options.isRadial;
			$scope.colors = options.colors;
			$scope.size = options.size;			 
		} else {
			$scope.gradientDirection = "radial";
			$scope.isPercentage = false;
			$scope.isRepeating = true;
			$scope.isRadial = true;
			$scope.colors = [
				{hex: "#7ae2ff", percentage: 50},
				{hex: "#000077", percentage: 51}
			];
			$scope.size = 34;
		}	
	};
	
	$scope.saveToCache = function() {
		var options = {
			isPercentage:	   $scope.isPercentage,
			isRepeating:	   $scope.isRepeating,
			isRadial: 		   $scope.isRadial,
			size: 			   $scope.size,
			colors: 		   $scope.colors,
			gradientDirection: $scope.gradientDirection
		};
		cache["savedImage"] = JSON.stringify(options);
	};
	
	$scope.$watch(function() {
		var name = "";
		if ($scope.isVisible) {
			$scope.iconDisplay = "icon-caret-up";
			$scope.display = "block";
			name = "Close";
		} else {
			$scope.iconDisplay = "icon-caret-down";
			$scope.display = "none";
			name = "Open";
		}
		return name;
	},function(name){
		$scope.displayToggle = name;
	});
	
	$scope.$watch(function() {
		$scope.measurement = ($scope.isPercentage) ? "%" : "px";
		return	$scope.size + $scope.measurement + " " + $scope.size + $scope.measurement + ";";	
	},function(opt) {
		$scope.bgSize = opt;
		$scope.saveToCache();
	});

	$scope.$watch(function() {
		$scope.gradientDirection = ($scope.isRadial) ? "Radial" : "Linear";
		$scope.iconDirection = ($scope.isRadial) ? "icon-radio-checked" : "icon-menu";
		return $scope.gradientDirection;
	},function(name) {
		$scope.nameDirection = name;
	});
	
	$scope.$watch(function() {
		return ($scope.isRepeating) ? "Repeating - On" : "Repeating - Off";
	},function(name) {
		$scope.nameRepeating = name;
	});
	
	$scope.addColor = function() {
	 	$scope.colors.push({hex: "#ff0000", percentage: 100});
	 };
	 
	$scope.removeColor = function(index) {
		$scope.colors.splice(index, 1);
	};
	
	$scope.$watch(function() { 	
		var color = ""
	 		strColor = "",
	 		strLstColors = "",
	 		len = $scope.colors.length,
	 		bg = [
					"-webkit-gradient(",
					"-moz-",			
					"-webkit-",
					"-o-",
					"-ms-",
					""
	 			 ];
	 	
	 	for (var i=0; i<len; i++) {
	 		color = $scope.colors[i];
			strColor = color.hex + " " + color.percentage + "%";
	 		if (i+1!==len) strColor += ","
			strLstColors += strColor;
	 	}

	 	if($scope.isRepeating) {	 		
	 		// skip first webkit because their is no repeating option
	 		bg.splice(0,1);
	 		for (var i=0,l=bg.length; i<l; i++) {
	 			bg[i] += "repeating-";
	 			bg[i] += $scope.gradientDirection + "-gradient( "+strLstColors+");";
	 		}
	 	} else {
			bg[0] += $scope.gradientDirection + ", " + +strLstColors+");";
			for (var i=1,l=bg.length; i<l; i++) {
				bg[i] += $scope.gradientDirection + "-gradient( "+strLstColors+");";
			}
		}
		$scope.cssBg = bg;
		return bg.join("background-image: ");
	}, function(bgImage) {
	 	$scope.bgImage = bgImage;
	 	$scope.saveToCache();
	});
	
	$scope.sizeMinus = function() {
		$scope.size--;
	}
	
	$scope.sizePlus = function() {
		$scope.size++;
	}
	
	$scope.positionAdd = function(index) {
		$scope.colors[index].percentage++;
	}
	
	$scope.positionMinus = function(index) {
		$scope.colors[index].percentage--;
	}
	
	$scope.showCSS = function() {
		var css =	"background: " + this.bgImage + 
					"background-size: " + this.bgSize + ";";
		
		document.querySelector("#control-panel").classList.toggle("flip");
	};
});		

angular.bootstrap(document, ['app']);
