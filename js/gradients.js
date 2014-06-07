//  Title:  CSS3 Gradient GUI
//  Author:  Nathaniel Foster
//  Website: nfoster.net
//  Email: nate@nfoster.net
//  Version: 1.2

angular.module('app', ['ngTouch']);

var app = angular.module('app', []);
var Color = function(val, percentage) {
	var color = {
		val : val,
		percentage : {
			val : percentage,
			plus : function () {
				this.val++;
			},
			minus : function () {
				this.val--;
			}
		}
	}
	return color;
};
var Layer = function(opt) {
	var layer = {
		id: opt.id ? opt.id : 0,
		gradientDirection: "linear",
		angle: {
			val: opt.angle ? opt.angle : 45, //getRandomInt(0,360),
			plus: function () {
				this.val++;
			},
			minus: function() {
				this.val--;
			}
		},
		isRepeating: opt.isRepeating ? opt.isRepeating : false,
		isRadial: opt.isRadial ? opt.isRadial : false,
		gradientDirection: opt.isRadial ? "radial" : "linear",
		color: {
			list: opt.colors ? opt.colors : LAYER1_COLORS,
			display : {
				btnRemove : "none"
			},
			add: function () {
				this.list.push(new Color("#ff0000", 100));
				this.display.btnRemove = (this.list.length > 2) ? "block" : "none";
			},
			remove: function (index) {
				this.list.splice(index, 1);
				this.display.btnRemove = (this.list.length > 2) ? "block" : "none";
			}
		}
	}

	return layer;
};
var Size  = function(val, isPercentage) {
	var size = {
		val : val,
		isPercentage : isPercentage,
		plus: function () {
				this.val++;
		},
		minus: function() {
				this.val--;
		}
	};
	(function() {
		size.measurement = isPercentage ? "%" : "px";
	})
	return size;
};
var cache = window.localStorage ? window.localStorage : {};
var LAYER1_COLORS = [
			new Color ("rgba(150,255,255,1)", 50),
			new Color ("rgba(  0,  0,150,1)", 51)
		],
		LAYER2_COLORS = [
			new Color ("rgba(74, 255, 74, 0.3)", 50),
			new Color ("rgba(246, 255, 0, 0.5)", 51)
		];

function createGradientPrefixes (lyr, h) {
	var prefixes = [
			//"-webkit-gradient(",
			"-moz-",
			"-webkit-",
			"-o-",
			"-ms-",
			""
		],
		len = prefixes.length,
		gradientPrefix = "",
		bg = [];

	for (var i=0; i<len; i++) {
		bg[i] = (bg[i]) ? bg[i] + gradients[i] : gradients[i];
		if(lyr.isRepeating) bg[i] += "repeating-";
		bg[i] += lyr.gradientDirection + "-gradient( ";
		if (lyr.gradientDirection.toLowerCase() === "linear") bg[i] += lyr.angle.val + "deg, ";
		bg[i] += strLstColors+")";
		if (h !== 0) bg[i] += ",";
		else bg[i] += ";";
	}
	return bg;

};

function createGradient(colors) {
	var color = ""
		strLstColors = "",
		strColor = "";

	len = colors.length;
	for (var i=0; i<len; i++) {
		color = colors[i];
		strColor = color.val + " " + color.percentage.val + "%";
		if (i+1!==len) strColor += ","
		strLstColors += strColor;
	}
	return strLstColors;
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand_color() {
	var min = 0,
			max = 255,
			color = {
				r: getRandomInt(min, max),
				g: getRandomInt(min, max),
				b: getRandomInt(min, max),
				o: Math.random().toFixed(2)
			}

	return color;
};

app.directive('uiColorpicker', function() {
		return {
				restrict: 'E',
				require: 'ngModel',
				scope: false,
				replace: true,
				template: "<span><input type='color' class='input-small' /></span>",
				link: function(scope, element, attrs, ngModel) {
						var input = element.find('input');
						var options = angular.extend({
								color: ngModel.$viewValue,
								move: function(color) {
										scope.$apply(function() {
											ngModel.$setViewValue(color.toRgbString());
										});
								},
								showAlpha: true,
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
	$scope.displayAngleControl = "block";

	$scope.resetApp = function() {
		$scope.layer.list = [];
		$scope.layer.list[0] = new Layer({
															id: 0,
															colors: LAYER1_COLORS,
															isRadial: true,
															isRepeating: true
														});
		$scope.layer.change(0);
	};

	$scope.size = {
		val: 75,
		isPercentage: false,
		measurement: "px",
		plus: function () {
				this.val++;
		},
		minus: function() {
				this.val--;
		}
	}

	$scope.layer = {
		index: 0,
		list: [],
		current: {},
		display: {
			btnRemove: "none"
		},
		add : function() {
			var newIndex = this.list.length;

			this.list[newIndex] = new Layer({
															id: newIndex,
															colors: [
																new Color ("rgba(  0, 255, 22, 0.3)", 50),
																new Color ("rgba(246, 255,  0, 0.4)", 51)
															],
															angle: 225
														});
			this.change(newIndex);
		},
		remove : function() {
			console.log(this.current.index);
			var index = $scope.layer.current.index,
				newIndex = (index === 0) ? 0 : index - 1;

			this.list.splice(index, 1);
			this.change(newIndex);
		},
		change : function(index) {
			this.current = this.list[index];
			this.current.index = index;
			console.log(index);
			this.display.btnRemove = (this.list.length > 1) ? "block" : "none";
 		}
	};

	$scope.init = function () {
		if (cache["saved"] &&
				cache["saved"].length > 0) {
			var saved = JSON.parse(cache["saved"]),
					list  = saved.list,
					len   = list.length,
					colors = [],
					colorObjs = [];

			for (var i=0; i<len; i++) {
				colors = list[i].color.list,
				l = colors.length;
				colorObjs = [];

				for (var j=0; j<l; j++) {
					colorObjs[j] = new Color(colors[j].val, colors[j].percentage.val);
				}

				$scope.layer.list[i] = new Layer({
						id: i,
						colors: colorObjs,
						angle: list[i].angle.val,
						isRepeating : list[i].isRepeating,
						isRadial : list[i].isRadial
				});
			}

			$scope.size = new Size(saved.size.val, saved.size.isPercentage);
		} else {
			$scope.layer.list[0] = new Layer({
																id: 0,
																colors: LAYER1_COLORS,
																isRadial: true,
																isRepeating: true
															});
		}

		$scope.layer.change(0);
	};

	$scope.saveToCache = function() {
		cache["saved"] = JSON.stringify({
			list: $scope.layer.list,
			size: $scope.size
		});
		// console.log(cache["saved"]);
	};

	// 	size measurement is percentage or px
	$scope.$watch(function() {
		var s = $scope.size;
		s.measurement = (s.isPercentage) ? "%" : "px";
		return	s.val + s.measurement + " " + s.val + s.measurement + ";";
	},function(opt) {
		$scope.bgSize = opt;
		$scope.saveToCache();
	});

	$scope.$watch(function() {
		var l = $scope.layer.current;
		l.gradientDirection  = (l.isRadial) ? "Radial" : "Linear";
		$scope.iconDirection = (l.isRadial) ? "icon-radio-checked" : "icon-menu";
		$scope.displayAngleControl  = (l.isRadial) ? "none" : "block";
		return l.gradientDirection;
	},function(name) {
		console.log(name);
		$scope.nameDirection = name;
	});

	// display: btn isRepeating
	$scope.$watch(function() {
		return ($scope.layer.current.isRepeating) ? "Repeating - On" : "Repeating - Off";
	},function(name) {
		$scope.nameRepeating = name;
	});

	// control open/close gradient ui
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

	// display: create gradient from layer and add to display
	$scope.$watch(function() {
		var color = ""
			strColor = "",
			strLstColors = "",
			len = 0,
			prefixLayer = [],
			bg = [],
			gradients = [
					//"-webkit-gradient(",
					"-moz-",
					"-webkit-",
					"-o-",
					"-ms-",
					""
			];

		var lyr = {},
				l = "";
		for (var h=$scope.layer.list.length-1; h>=0; h--) {
			lyr = $scope.layer.list[h];
			strLstColors = createGradient(lyr.color.list);
			l = "";
			len = gradients.length;

			// loop through different browser css prefixes
			for (var i=0; i<len; i++) {
				l = gradients[i];
				if(lyr.isRepeating) l += "repeating-";
				l += lyr.gradientDirection + "-gradient( ";
				if (lyr.gradientDirection.toLowerCase() === "linear") l += lyr.angle.val + "deg, ";
				l += strLstColors+")";
				prefixLayer[i] = l + ";";
				if (h !== 0) l += ",";
				else l += ";";

				bg[i] = (bg[i]) ? bg[i] + l : l;
			}
			$scope.layer.list[h].gradient = prefixLayer.join("background: ");
		}
		console.log(bg);
		$scope.cssBg = bg;
		return bg.join("background: ");
	}, function(bgImage) {
		$scope.bgImage = bgImage;
		$scope.saveToCache();
	});

	$scope.showCSS = function() {
		var css = "background: " + this.bgImage +
							"background-size: " + this.bgSize + ";";

		document.querySelector("#control-panel").classList.toggle("flip");
	};
});

angular.bootstrap(document, ['app']);

$(document).ready(function (e) {
	document.getElementById("control-panel").style.display = "block";

});
