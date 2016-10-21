;(function($){
	
	var LightBox = function(){
		var self = this;

		this.mask = $('<div id="lb-mask">');
		this.popup = $('<div id="lb-popup">');

		this.bodyNode = $(document.body);

		this.renderDOM();

		this.lbView = this.popup.find(".lb-view");
		this.lbImg = this.popup.find(".lb-img");
		this.lbNextBtn = this.popup.find(".lb-btn-next");
		this.lbPrevBtn = this.popup.find(".lb-btn-prev");
		this.lbCap = this.popup.find(".lb-cap");
		this.lbDes = this.popup.find(".lb-des");
		this.currentIndex = this.popup.find(".lb-index");
		this.lbX = this.popup.find(".lb-x");

		this.groupName = null;
		this.groupData = [];
		this.bodyNode.delegate(".js-lb","click",function(e){
			e.stopPropagation();

			var currentGroupName = $(this).attr("data-group");

			if(currentGroupName != self.groupName){
				self.groupName = currentGroupName;
				self.getGroup();
			}

			self.initPopup($(this));
		});

		this.mask.click(function(){
			$(this).fadeOut();
			self.popup.fadeOut();
		});
		this.lbX.click(function(){
			self.mask.fadeOut();
			self.popup.fadeOut();
		});

		this.flag = true;
		this.lbNextBtn.hover(function(){
				if(!$(this).hasClass("disabled")&&self.groupData.length > 1){
					$(this).addClass("lb-btn-next-show");
				};
			},function(){
				if(!$(this).hasClass("disabled")&&self.groupData.length > 1){
				$(this).removeClass("lb-btn-next-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled") && self.flag){
				self.flag = false;
				e.stopPropagation();
				self.goto("next");
			};
		});
		this.lbPrevBtn.hover(function(){
				if(!$(this).hasClass("disabled")&&self.groupData.length > 1){
					$(this).addClass("lb-btn-prev-show");
				};
			},function(){
				if(!$(this).hasClass("disabled")&&self.groupData.length > 1){
				$(this).removeClass("lb-btn-prev-show");
			}
		}).click(function(e){
			if(!$(this).hasClass("disabled") && self.flag){
				self.flag = false;
				e.stopPropagation();
				self.goto("prev");
			};
		});



	};

	LightBox.prototype = {

		goto : function(dir){
			if(dir === "next"){

				this.index++;
				if(this.index >= this.groupData.length - 1){
					this.lbNextBtn.addClass("disabled").removeClass("lb-btn-next-show")
				};
				if(this.index != 0){
					this.lbPrevBtn.removeClass("disabled")
				};
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);

			}else if(dir === "prev"){

				this.index--;
				if(this.index < this.groupData.length -1){
					this.lbNextBtn.removeClass("disabled");
				};
				if(this.index <= 0){
					this.lbPrevBtn.addClass("disabled").removeClass("lb-btn-prev-show");
				};
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);
			};
		},

		showMaskAndPopup : function(sourceSrc,currentId){
			var self = this;
			this.lbImg.hide();
			this.lbCap.hide();

			this.mask.fadeIn();

			var winWidth = $(window).width(),
				winHeight = $(window).height();

			this.lbView.css({
				width : winWidth/2,
				height: winHeight/2
			});
			this.popup.fadeIn();

			var viewHeight = winHeight / 2 + 10;
			this.popup.css({
				width : winWidth / 2 + 10,
				height: winHeight / 2 + 10,
				marginLeft : -(winWidth / 2 + 10)/2,
				top : -viewHeight,

				}).animate({
					top : (winHeight-viewHeight) / 2
				},function(){
					self.loadPicSize(sourceSrc);
			});

			this.index = this.getIndexOf(currentId);
			//console.log(this.index);

			var groupDataLength = this.groupData.length;
			if(groupDataLength > 1){
				if(this.index === 0){
					//console.log("ok");
					this.lbPrevBtn.addClass('disabled');
					this.lbNextBtn.removeClass('disabled');
				}else if(this.index === groupDataLength - 1){
					this.lbNextBtn.addClass('disabled');
					this.lbPrevBtn.removeClass('disabled');
				}else{
					this.lbNextBtn.removeClass('disabled');
					this.lbPrevBtn.removeClass('disabled');					
				};
			};

		},

		loadPicSize : function(sourceSrc){
			var self = this;
			//console.log(sourceSrc);
			self.lbImg.css({
				width : "auto",
				height: "auto"
			}).hide();

			this.preLoadImg(sourceSrc,function(){
				//alert("ok");
				self.lbImg.attr("src",sourceSrc);
				var picWidth = self.lbImg.width(),
					picHeight= self.lbImg.height();
				//console.log(picWidth,picHeight);
				self.changePic(picWidth,picHeight);
			});
		},

		changePic : function(width,height){
			var self = this,
				winWidth = $(window).width(),
				winHeight= $(window).height();

			var scale = Math.min(winWidth / (width + 10),winHeight / (height + 10),1);

			width = width * scale;
			height= height *scale;

			this.lbView.animate({
				width : width - 10,
				height: height - 10,
			});
			this.popup.animate({
					width : width,
					height: height,
					marginLeft : -(width) / 2,
					top : (winHeight - height) / 2,
				},function(){
					self.lbImg.css({
						width : width - 10,
						height: height - 10,
					}).fadeIn();
					self.lbCap.fadeIn();
					self.flag = true;
			});

			this.lbDes.text(this.groupData[this.index].des);
			this.currentIndex.text("索引" + (this.index + 1) + "/" + this.groupData.length);

		},

		preLoadImg : function(src,callback){
			var img = new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange = function(){
					if(this.readyState == 'complete'){
						callback();
					};
				};
			}else{
				img.onload = function(){
					callback();
				};
			};
			img.src = src;
		},

		getIndexOf : function(currentId){
			var index = 0;
			$(this.groupData).each(function(i){
				index = i;
				if(this.id === currentId){
					return false;
				};
			});
			return index;
		},

		initPopup :function(currentObj){
			var self = this,
				sourceSrc = currentObj.attr("data-source"),
				currentId = currentObj.attr("data-id");

			this.showMaskAndPopup(sourceSrc,currentId);
		},

		getGroup : function(){
			var self = this;

			var groupList = this.bodyNode.find("*[data-group = "+ this.groupName +"]");
			// alert(groupList.size())
			self.groupData.length = 0;
			groupList.each(function(){
				self.groupData.push({
					src : $(this).attr("data-source"),
					id : $(this).attr("data-id"),
					des : $(this).attr("data-des"),
				});
			});
		},

		renderDOM : function(){
			var strDOM='<div class="lb-view">'+
					'<span class="lb-btn lb-btn-prev"></span>'+
					'<img class="lb-img" src="img/pic.jpg" />'+
					'<span class="lb-btn lb-btn-next"></span>'+
				'</div>'+
				'<div id="lb-cap">'+
					'<div class="lb-left">'+
						'<p class="lb-des">标题</p>'+
						'<span class="lb-index">索引</span>'+
					'</div>'+
					'<span class="lb-x"></span>'+
				'</div>';

			this.popup.html(strDOM);
			this.bodyNode.append(this.mask,this.popup);
		}
	};

	window['LightBox'] = LightBox;

})(jQuery);