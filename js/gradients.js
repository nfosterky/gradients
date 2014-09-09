//  Title:  CSS3 Gradient GUI
//  Author:  Nathaniel Foster
//  Website: nfoster.net
//  Email: nate@nfoster.net
//  Version: 1.2

angular.module('app', ['ngTouch']);

var app = angular.module('app', []);

var range = function(spec) {
	return {
		val: spec.val ? spec.val : 0,
		min: spec.min ? spec.min : 0,
		max: spec.max ? spec.max : 100,
		plus: function() {
			if (this.val < this.max) {
				this.val++;
			}
		},
		minus: function() {
			if (this.val > this.min) {
				this.val--;
			}
		}
	};
};

var color = function color (val, percentage) {
	return {
		val: val,
		percentage: range({
			val: percentage ? percentage : 50,
			min: 0,
			max: 100
		})
	};
};

var layer = function layer (opt) {
	return {
		id: opt.id ? opt.id : 0,
		gradientDirection: opt.isRadial ? "radial" : "linear",
		angle: range({
			val: opt.angle ? opt.angle : 45,
			min: 0,
			max: 360
		}),
		isRepeating: opt.isRepeating ? opt.isRepeating : false,
		isRadial: opt.isRadial ? opt.isRadial : false,
		color: {
			list: opt.colors ? opt.colors : LAYER1_COLORS,
			display : {
				btnRemove : opt.colors && opt.colors.length > 2 ? "block" : "none"
			},
			add: function () {
				this.list.push(color("#ff0000", 100));
				this.display.btnRemove = (this.list.length > 2) ? "block" : "none";
			},
			remove: function (index) {
				this.list.splice(index, 1);
				this.display.btnRemove = (this.list.length > 2) ? "block" : "none";
			}
		}
	};
};

var size = function size (val, isPercentage) {
	var self = range({
		val: val ? val : 50,
		min: 0,
		max: 500
	});
	self.isPercentage = isPercentage;
	self.measurement = isPercentage ? "%" : "px";
	return self;
};

var defaultLayers = function() {
		return [
			layer({
				id: 0,
				colors: [
					color("rgb(200, 200, 255)", 30),
					color("rgb(10, 0, 100)", 70)
				],
				angle: 160,
				isRadial: false,
				isRepeating: false
			}),
			layer({
				id: 1,
				colors: [
					color("rgba(250, 250, 250, 0.3)", 1),
					color("rgba(0, 0, 0, 0.4)", 100)
				],
				isRadial: true,
				isRepeating: false
			}),
			layer({
				id: 2,
				colors: [
					color("rgba(  0, 255,  22, 0)", 48),
					color("rgba( 90,  90, 165, 1)", 50),
					color("rgba(158, 151, 209, 1)", 95),
					color("rgba(255, 255, 255, 1)", 100)
				],
				isRadial: true,
				isRepeating: false
			}),
			layer({
				id: 3,
				colors: [
					color("rgba(200, 255,  30, 0.2)", 25),
					color("rgba( 90,  30, 140, 0.4)", 50),
					color("rgba(200, 255,  30, 0.2)", 75)
				],
				angle: 135,
				isRadial: false,
				isRepeating: true
			})
		];
};

var cache = window.localStorage ? window.localStorage : {};
var LYR1_CLR1 = "rgba(150,255,255,1)",
		LYR1_CLR2 = "rgba(  0,  0,150,1)",
		LAYER2_COLORS = [
			color("rgba(74, 255, 74, 0.3)", 50),
			color("rgba(246, 255, 0, 0.5)", 51)
		];

function createGradientPrefixes (lyr, h) {
	var prefixes = [
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
		if(lyr.isRepeating) {
			bg[i] += "repeating-";
		}
		bg[i] += lyr.gradientDirection + "-gradient( ";
		if (lyr.gradientDirection.toLowerCase() === "linear") {
			bg[i] += lyr.angle.val + "deg, ";
		}
		bg[i] += strLstColors+")";
		if (h !== 0) {
			bg[i] += ",";
		} else bg[i] += ";";
	}
	return bg;
}

function createGradient(colors) {
	var color = "",
			strLstColors = "",
			strColor = "",
			len = colors.length;

	for (var i=0; i<len; i++) {
		color = colors[i];
		strColor = color.val + " " + color.percentage.val + "%";
		if (i+1!==len) {
			strColor += ",";
		}
		strLstColors += strColor;
	}
	return strLstColors;
}

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
			};

	return color;
}

app.directive('uiColorpicker', function() {
		return {
			restrict: 'E',
			require: 'ngModel',
			scope: false,
			replace: true,
			template: "<span><input type='color' class='input-small' /></span>",
			link: function(scope, element, attrs, ngModel) {
				var input = element.find('input'),
						options = angular.extend({
							color: ngModel.$viewValue,
							move: function(color) {
								scope.$apply(function() {
									ngModel.$setViewValue(color.toRgbString());
								});
							},
							showAlpha: true,
							showInput: true,
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
	$scope.btnCssVisibility = "visible";
	$scope.isVisible = false;
	$scope.displayAngleControl = "block";

	$scope.resetApp = function() {
		$scope.layer.list = [];
		$scope.layer.list = defaultLayers();
		$scope.layer.change(0);
		$scope.size = size(75, false);
	};

	$scope.size = size(75, false);

	$scope.layer = {
		index: 0,
		list: [],
		current: {},
		display: {
			btnRemove: "none"
		},
		add: function() {
			var newIndex = this.list.length;

			this.list[newIndex] = layer({
				id: newIndex,
				colors: [
					color("rgba(  0, 255, 22, 0.3)", 50),
					color("rgba(246, 255,  0, 0.4)", 51)
				],
				angle: 225
			});
			this.change(newIndex);
		},
		remove: function() {
			var index = $scope.layer.current.index,
				newIndex = (index === 0) ? 0 : index - 1;

			this.list.splice(index, 1);
			this.change(newIndex);
		},
		change: function(index) {
			this.current = this.list[index];
			this.current.index = index;
			this.display.btnRemove = this.list.length > 1 ? "block" : "none";
 		}
	};

	$scope.init = function () {
		if (cache.saved && cache.saved.length) {
			var saved = JSON.parse(cache.saved),
					list = saved.list,
					len = list.length,
					colors = [],
					colorObjs = [];

			for (var i=0; i<len; i++) {
				colors = list[i].color.list;
				l = colors.length;
				colorObjs = [];

				for (var j=0; j<l; j++) {
					colorObjs[j] = color(colors[j].val, colors[j].percentage.val);
				}

				$scope.layer.list[i] = layer({
					id: i,
					colors: colorObjs,
					angle: list[i].angle.val,
					isRepeating : list[i].isRepeating,
					isRadial : list[i].isRadial
				});
			}

			$scope.size = size(saved.size.val, saved.size.isPercentage);
		} else {
			$scope.layer.list = defaultLayers();
		}

		$scope.layer.change(0);
	};

	$scope.saveToCache = function() {
		cache.saved = JSON.stringify({
			list: $scope.layer.list,
			size: $scope.size
		});
	};

	// 	size measurement is percentage or px
	$scope.$watch(function() {
		var s = $scope.size;

		s.measurement = s.isPercentage ? "%" : "px";
		return	s.val + s.measurement + " " + s.val + s.measurement + ";";
	},function(opt) {
		$scope.bgSize = opt;
		$scope.saveToCache();
	});

	// radial / linear control
	$scope.$watch(function() {
		var l = $scope.layer.current;

		l.gradientDirection  = l.isRadial ? "Radial" : "Linear";
		$scope.iconDirection = l.isRadial ? "icon-radio-checked" : "icon-menu";
		$scope.displayAngleControl  = l.isRadial ? "none" : "block";
		return l.gradientDirection;
	},function(name) {
		$scope.nameDirection = name;
	});

	// display: btn isRepeating
	$scope.$watch(function() {
		return $scope.layer.current.isRepeating ? "Repeating - On" : "Repeating - Off";
	},function(name) {
		$scope.nameRepeating = name;
	});

	// control open/close gradient ui
	$scope.$watch(function() {
		var name = "";
		if ($scope.isVisible) {
			$scope.iconDisplay = "icon-caret-up";
			$scope.display = "inline-block";
			$scope.btnCssVisibility = "visible";
			name = "Close";
		} else {
			$scope.iconDisplay = "icon-caret-down";
			$scope.display = "none";
			$scope.btnCssVisibility = "hidden";
			name = "Open";
		}
		return name;
	},function(name){
		$scope.displayToggle = name;
	});

	// display: create gradient from layer and add to display
	$scope.$watch(function() {
		var color = "",
				strColor = "",
				strLstColors = "",
				len = 0,
				prefixLayer = [],
				bg = [],
				gradients = [
					"-moz-",
					"-webkit-",
					"-o-",
					"-ms-",
					""
				],
				lyr = {},
				l = "";

		for (var h=$scope.layer.list.length-1; h>=0; h--) {
			lyr = $scope.layer.list[h];
			strLstColors = createGradient(lyr.color.list);
			l = "";
			len = gradients.length;

			// loop through different browser css prefixes
			for (var i=0; i<len; i++) {
				l = gradients[i];
				if (lyr.isRepeating) {
					l += "repeating-";
				}
				l += lyr.gradientDirection + "-gradient( ";
				if (lyr.gradientDirection.toLowerCase() === "linear") {
					l += lyr.angle.val + "deg, ";
				}
				l += strLstColors+")";
				prefixLayer[i] = l + ";";
				if (h) {
					l += ",\n";
				} else {
					l += ";";
				}
				bg[i] = (bg[i]) ? bg[i] + l : l;
			}
			$scope.layer.list[h].gradient = prefixLayer.join("background: ");
		}

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
