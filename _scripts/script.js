// TODO

// - inquire on phone causes two windows to open (this only happens in developer mode on desktop?)

// - prevent magnification from changing layout

// DONE - remove extra footer space on home when loaded from loadURL

// DONE - add functionality to flip through image sets
// optional: show same images on back button, add custom cursor, fade-in arrows to suggest slideshow
// DONE - add captions to project images

// DONE - add video (vimeo) capabilities

// DONE - add text link capabilities

// DONE - create about page
// NO - add about blurb on home
// - create inquire page
// - add phone number to About or Inquire?

// DONE - fix font sizes on mobile, tablet
// DONE - fix layout on tablet for project
// DONE - fix layout on mobile for project, home
// DONE - make all text black on mobile

// - extend clickable project icon across image and text (close the gap between them)

// - on resizeCanvas, change the layout

// - add instagram button

// - add favicon
// DONE - add website title
// DONE - add website page titles

// - hover arrows on mobile over the image sets

// - create custom 404 page

// - keep images in memory to load previously visited paged faster
// - OR, on back button, load images closest to window viewport first

// - access archive by scrolling down to bottom, then up to top, then back down to bottom

// - make "about" fade out after clicking on it

// - don't open new tab for email on mobile

// - improve SEO (page-specific titles, tags, descriptions in HTML) (?)

// - prevent flippable images from showing before being laid out

// Photos:
// - burn edges

// ==============================================

// ======================
// ======== NEWS ========
// ======================

// Change this to add a news story
var bNewsHeadline = false
var newsHeadline = ""
var newsHeadlineURL = ""


// ==============================================

// Website designed to work and be readable on desktop/tablet for screens > 768 px
// https://www.websitedimensions.com
// Website designed to change to mobile design if window.mobilecheck() returns true
// https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser

// Ref: alignment: https://stackoverflow.com/questions/12744928/in-jquery-how-can-i-set-top-left-properties-of-an-element-with-position-values

// fonts: Aver, Neris, Lato, 
// title serif: Andale, Baskerville, Batang*, Bell MT, Bookman Old Style, CAllisto MT, Cochin*, Consolas, Didot
// body serif: Cambria, Cochin*, Century, Garamond

var mainURL = "http://grayswartzel.github.io";
var domainKey = "grayswartzel";	// used to check if we're in my domain
var mailKey = "mailto";

// window parameters
var w = new Params();
// set whether we have a news headline
w.setHeader(bNewsHeadline);

// Stores all projects for home
var projects;
// Dict of pageID : { projectID : #, scrollTop : #, pageHeight : # }
var dict = {};
// Stores images for a project
var project = {};
// NOTE: jsons CANNOT have commas at the end of their last element (otherwise they will not be parsed)
// arrows for animating image sets
// var arrows = {};
var about = {};
var inquire = {};

// Stores the logo at the top of the page
var menu = {};
var bKeepMenu = true;
var emailLink = "mailto:grayswartzel@gmail.com?subject=Hello!";
//				     ID 		TEXT 			URL_SUFFIX
var menuElems = [ 	["logo", 	"Gray Swartzel", 	""],
					["about", 	"about", 		"about"],
					["and", 	"  &  ", 		null],
					["inquire", "inquire", 		"inquire"]
				];

// Fonts we're using
// var fonts["title"] = "Didot";
var fonts = {	"title": "Didot",
				"body": "Garamond",
				"menu" : "Didot_i" };
// Fonts available
// 					NAME 			FILENAME
var fontLib = [ [	"Cochin",		"cochin.ttc"	],
				[	"Batang",		"batang.ttf"	],
				[	"Consolas",		"consolas.ttf"	],
				// [	"Didot",		"didot.ttc"],
				[	"Didot",		"didot-regular.ttf"],
				[	"Baskerville", 	"baskerville.ttc"],
				[ 	"Garamond", 	"garamond.ttf"],
				[ 	"Playfair_r",	"playfair/PlayfairDisplay-Regular.ttf"],
				[ 	"Playfair_ri",	"playfair/PlayfairDisplay-Italic.ttf"],
				[ 	"Playfair_b",	"playfair/PlayfairDisplay-Bold.ttf"],
				[ 	"Playfair_bi",	"playfair/PlayfairDisplay-BoldItalic.ttf"],
				[ 	"Playfair_k",	"playfair/PlayfairDisplay-Black.ttf"],
				[ 	"Playfair_ki",	"playfair/PlayfairDisplay-BlackItalic.ttf"],
				[	"Didot_i",		"didot_italic.ttf"],
				[	"Didot_b",		"didot_bold.ttf"],
				];
// New ones:
// https://p22.com/family-Mackinac

// Instagram icon
icon_ig = {};
icon_news = {};

stopScrollRestoration();

// Get the specific page given a url (doesn't check if in domain)
function getPage(url) {
	var tmpUrl = strip(url, "/");
	var elems = tmpUrl.split("/");
	var pageID = "home";
	if (elems.length != 0) {
		var page = elems[elems.length-1];
		pageID = (page.includes(domainKey) || page.includes("localhost")) ? "home" : page;
	}
	return pageID;
}
function getThisPage() {

	return getPage(window.location.href);
}
// Get the prefix for any path in the relative directory
function pathPrefix() {

	return getThisPage()=="home" ? "" : "../";
}

// Fadeout all async elements
function fadeOut(bForceAll = false) {
	var fadeOutMs = 200;

	var searchElems = bForceAll ? ".async, .menu" : (bKeepMenu ? ".async" : ".async, .menu" );
	var elems = $( searchElems );

	elems.each( function(index, element) {
		// Fade them out
		$( element ).fadeOut( fadeOutMs );
		// Delete them after this much time
		setTimeout( function() { $( element ).remove(); }, fadeOutMs );
	});
	var fadeOutDone = $.Deferred();
	setTimeout( function() { fadeOutDone.resolve(); }, fadeOutMs );
	return fadeOutDone;
}

function loadFonts() {	
	// should this include a deferred promise to ensure font is loaded? (what if the font isn't accessible?)
	var usedFonts = getDictValues(fonts);
	$.each(fontLib, function(index, element) {

		if (usedFonts.includes(element[0])) {
			var font = new FontFace( element[0], "url(" + pathPrefix() + "/_fonts/" + element[1] + ")", {} );
			document.fonts.add( font );
			font.load();
		}
	}); 
	return null;
}

function loadIcons() {
	// Load the instagram icon
	icon_ig["img"] = getImageElement("icon_ig", pathPrefix() + "_assets/misc/instagram_icon.svg", "https://www.instagram.com/snellicious/", ["menu"]);
	$( icon_ig["img"] ).attr( 'src', $( icon_ig["img"] ).attr( 'src-tmp' ) );

	// Create news div
	if (bNewsHeadline) {
		icon_news["div"] = getDivElement("news_div", newsHeadlineURL, ["menu"], "pointer");
		$( icon_news["div"] ).hide()
		icon_news["div"].innerHTML = " "; //newsHeadline;

		icon_news["txt"] = getTextElement("news_txt", newsHeadline, newsHeadlineURL, fonts["body"], w.titleColor, ["menu"]);
		$(icon_news["txt"]).hide()

	}

	// menu[ "news_div" ] = { "div" : newsDiv };

}

// parse reference data to use later on
function parseHomeData(data) {

	if (!emptyDict(dict)) return;

	// Save projects
	projects = []
	$.each(data["projects"], function(index, element) {
		if (element["unlisted"] && element["unlisted"] == "true") {
			// don't add it
		} else {
			projects.push(element);
		}
	});

	// Parse projects into an accessible dictionary
	$.each(data["projects"], function(index, element) {
		dict[ getPage(element["url"]) ] = { "projectID" : element["projectID"] }
	});
	// also add home and menu items (minus logo)
	$.each( menuElems, function(index, element) {
		dict[ element[0]=="logo" ? "home" : element[0] ] = {};
	});

	// Set all scroll positions initially to 0
	$.each( dict, function(index, element) {
		element["scrollTop"] = 0;
	});
}
function loadHomeData() {
	var loadDict = function(data) { parseHomeData(data); };
	var jsonPath = pathPrefix()+"_json/home.json";
	var dictLoaded = $.Deferred();
    $.get(jsonPath, loadDict).done( function() { dictLoaded.resolve(); });
    return dictLoaded;
}

// make all links in a page a specific color
function colorLinks(hex) {

    var links = document.getElementsByTagName("a");
    for(var i=0;i<links.length;i++) {
        if(links[i].href) {

        	// var colorLink = true;
        	// $.each(menuElems, function(index, element) {
        	// 	colorLink = colorLink && (!links[i].innerHTML.includes(element[0]));
        	// })

        	// if (colorLink) links[i].style.color = hex;  

    		links[i].style.color = hex;  
        }
    }  
};


// Prepare images and text to be displayed
// function initArrows() {

// 	arrows.push( { "left" : getImageElement("left", pathPrefix()+"_assets/misc/arrow_left.png", "", ["async"], false) });
// 	arrows.push( { "right" : getImageElement("right", pathPrefix()+"_assets/misc/arrow_right.png", "", ["async"], false) });
// }
function initMenuItems() {

	$.each(menuElems, function(index, element) {

		// if (!elementExists(element[0])) {
		if (!bKeepMenu || !elementExists(element[0])) {
			var para = getTextElement(	element[0],
										element[1],
										(element[2]==null) ? "" : (element[2].includes(mailKey) ? element[2] : (mainURL + (element[2]=="" ? "" : "/"+element[2]))),
										element[0]=="logo" ? fonts["title"] : fonts["menu"],
										element[0]=="logo" ? w.titleColor : w.menuColor,
										["menu"],
										element[0]=="and" ? "default" : "pointer");
			menu[ element[0] ] = { "txt": para };
		}
	});

	return null;
}
function initHome() {

	var loadHomeItems = function(data) {
    	
    	// parse and store this data
    	parseHomeData(data);

    	// Iterate through all projects to create an image and text box for each one
    	$.each(projects, function(index, element) {

    		// Image
    		element["imgID"] = "img" + element["projectID"];
    		var imgPath = pathPrefix() + data["homeFolderName"] + "/" + element["projectID"] + "." + data["imgExt"];
    		element["img"] = getImageElement( element["imgID"], imgPath, element["url"], ["async"]);

		    // Text
			element["txtID"] = "txt" + element["projectID"];
			element["txt"] = getTextElement( element["txtID"], element["title"], element["url"], fonts["body"], w.homeCaptionColor, ["async"]);
    	});
	};

	// Parse the JSON with home's layout data
	var jsonPath = pathPrefix()+"_json/home.json";
	var def = $.Deferred();
    $.get(jsonPath, loadHomeItems).done( function() { def.resolve(); });
	return def;
}
function initAbout() {

	// Init the about json
	var loadAbout = function(data) { 
		// add the image and about description
		about["img"] = getImageElement("about_img", pathPrefix() + data["imgPath"], "", ["async"], false);
		about["txt"] = getTextElement("about_txt", data["description"], "", fonts["body"], w.dark, ["async"]);

		// Footer (call to actions)
		about["ftr"] = getTextElement("about_footer", data["footer"], "", fonts["body"], w.dark, ["async"]);
	};
	var aboutLoaded = $.Deferred();
	var jsonPath = pathPrefix() + "_json/about.json";
	$.get(jsonPath, loadAbout).done( function() { aboutLoaded.resolve(); });

	// make sure the dict is loaded
	var dictLoaded = loadHomeData();

	return [aboutLoaded, dictLoaded];
}
function initInquire() {

	// Init the inquire json
	var loadInquire = function(data) { 
		// add the description
		inquire['txt'] = getTextElement('inquire_txt', data["text"], "", fonts['body'], w.dark, ['async']);
	};
	var inquireLoaded = $.Deferred();
	var jsonPath = pathPrefix() + "_json/inquire.json";
	$.get(jsonPath, loadInquire).done( function() { inquireLoaded.resolve(); });

	// make sure the dict is loaded
	var dictLoaded = loadHomeData();

	return [inquireLoaded, dictLoaded];
}
function initProject(pageID) {

	// Make sure the dictionary is loaded
	var dictLoaded = loadHomeData();

    // When it's loaded, then get the projectID and load the json entry for that project
    var projectJsonLoaded = $.Deferred();
    $.when( dictLoaded ).done( function() {

    	var projectID = dict[pageID]["projectID"];
    	var projectJsonPath = pathPrefix() + "_json/" + projectID + ".json";
    	var loadProjectJson = function(data) { 

    		// store all image ids
    		var padImg = function(element) {
    			// anything over numDigits will be interpreted as a vimeo id
    			return isString(element) ? element : pad(element, data["numDigits"], "0");
    		};
    		project["images"] = data["images"].map(function(e) { 
    			if (isArray(e)) return e.map(function(e) { return padImg(e); });
    			else { return padImg(e); }
    		});

    		// store all image paths
    		// var attrDict = function(element) {
    		// 	return {
    		// 		"id" : element,
    		// 		"bVideo" : (element.length > data["numDigits"]) ? true : false,
    		// 		"path" : (element.length > data["numDigits"]) ? getVimeoPath(element) : (pathPrefix()+"_assets/"+projectID+"/"+element+"."+data["globalExt"])
    		// 	};
    		// }
    		// [REV to include GIFs and other file types]
	   		var attrDict = function(element) {
    			var bVideo = element.length > data["numDigits"] && !element.includes(".");
    			var bOtherType = !isNumeric(element);
    			var filename = bOtherType ? element : (element+"."+data["globalExt"]);
    			return {
    				"id" : element,
    				"bVideo" : bVideo,
    				"bOtherType" : bOtherType,
    				"path" : bVideo ? getVimeoPath(element) : (pathPrefix()+"_assets/"+projectID+"/"+filename)
    			};
    		}
    		project["images"] = project["images"].map(function(e) { 
    			if (isArray(e)) return e.map(function(e) { return attrDict(e); });
    			else return attrDict(e); 
    		}); 

    		// store text
    		project["text"] = [ {"id" : "title", "content" : data["title"]}, 
					    		{"id" : "role", "content" : data["role"]},
					    		{"id" : "date", "content" : data["date"]},
    							{"id" : "description", "content" : data["description"]}
    							];

    		// store the captions
			project["captions"] = {};
    		if (data["captions"]) project["captions"] = data["captions"];
    	};

    	// load the json
		$.get(projectJsonPath, loadProjectJson).done( function() { projectJsonLoaded.resolve(); });    	
	});

	// When the json entry is retrieved, initialize its entries
	var elementsLoaded = $.Deferred();
	$.when( projectJsonLoaded ).done( function() {

		// create project description
		$.each(project["text"], function(index, element) {
			element["txt"] = getTextElement(element["id"], element["content"], "", fonts["body"], w.dark, ["async"]);
		});

		// create images
		var getVisualElement = function(el) {
			return el["bVideo"] ? getVimeoElement(el["id"].split("_")[0], el["id"], ["async"], false) : getImageElement(el["id"], el["path"], "", ["async"], false);
		};
		$.each(project["images"], function(index, element) {
			if (isArray(element)) {
				$.each(element, function(i, e) {
					e["img"] = getVisualElement(e);
				});
			} else {
				element["img"] = getVisualElement(element);
			}
		});

		// create captions where available and associate with their images
		$.each( project["images"], function(index, element) {
			var tmp = isArray(element) ? element : [element];
			$.each( tmp, function(i, e) {
				var captionKey = parseInt(e["id"]).toString();
				if (project["captions"][captionKey]) e["caption"] = getTextElement(e["id"]+"_caption", project["captions"][captionKey], "", fonts["body"], w.medium, ["async"]);
			});
		});

		elementsLoaded.resolve();
	});

	return elementsLoaded;
}
function initPageSpecificItems(pageID) {
	if (pageID == "home") {
		return initHome();
	} else if (pageID == "about") {
		return initAbout();
	} else if (pageID == "inquire") {
		return initInquire();
	} else {
		return initProject(pageID);
	}
	return null;
}
function init(pageID, promise) {

	// color all links
	var defs = [];

	// defs.push(loadFonts()); // should only happen once, not every time something is initialized

	defs.push(initMenuItems());

	var pgsp = initPageSpecificItems(pageID); pgsp = isArray(pgsp) ? pgsp : [pgsp];
	$.each(pgsp, function(i, e) { defs.push(e); });
	// defs.push(initPageSpecificItems(pageID));

	$.when(... defs).done( function() { colorLinks(w.dark); promise.resolve(); });
}

// Scrolling and Height Utilities
function saveThisScrollTop() {

	dict[ getThisPage() ]["scrollTop"] = $( window ).scrollTop();
}
function saveThisPageHeight() {

	dict[ getThisPage() ]["pageHeight"] = $( document.body ).height();
}
function setPageHeight(height) {

	$( document.body ).css("height", height);

	// Then save the page height
	saveThisPageHeight();
}
function setFooterHeight(height) {

	setPageHeight( getElemsHeight() + height );
}
function finishPageLayout() {
	// make sure there's space at the bottom
	setFooterHeight( w.f2p(w.footerFrac) );
}
function setScrollTop(scrollTop) {

	$( window ).scrollTop(scrollTop);
}
function previouslyVisited(pageID="") {

	return dict[ (pageID=="" ? getThisPage() : pageID) ]["pageHeight"] != undefined; // should also be scrollTop?
}
function anticipatePageHeightAndScroll() {

	// If we've loaded this page before, set the page height
	if ( dict[ getThisPage() ]["pageHeight"] != undefined ) {
		setPageHeight( dict[ getThisPage() ]["pageHeight"] );
		// setFooterHeight( w.f2p(w.footerFrac) );
	}

	// scroll to the correct location
	if ( dict[ getThisPage() ]["scrollTop"] != undefined ) {
		setScrollTop(dict[ getThisPage() ]["scrollTop"]);
	}
}
function markPageUnvisited(pageID) {

	dict[pageID]["scrollTop"] = 0;
	dict[pageID]["pageHeight"] = undefined;
}

function setPageTitle(pageID) {

	if (pageID == "home") {
		document.title = "Gray Swartzel";
	} else if (pageID == "about") {
		document.title = "About | Gray Swartzel";
	} else if (pageID == "inquire") {
		document.title = "Inquire | Gray Swartzel";
	} else {
		document.title = findElementWithKeyValueInArray(project["text"], "id", "title")["content"] + " | Gray Swartzel";
	}
}

// Display Images and Text
function showMenuItems(bLayoutOnly=false) {

	// you need to change both of these numbers if you change one
	var andFrac = 0.71; 
	var andOffsetMult = 2.2;

	// If we're keeping the menu, don't change it
	if (!bLayoutOnly && bKeepMenu && $( "#"+menuElems[0][0] ).is(":visible")) return;

	var menuItems = [];
	var menuWidth = 0;
	$.each(menuElems, function(index, element) {

		var item = $( menu[ element[0] ]["txt"] );
		if (element[0] == "logo") {

			// call this when the first image is shown
			item.css("font-size", w.titleSizePx);
			item.css("letter-spacing", (w.titleLetterSpacing*w.titleSizePx) + "px"); // .1993
			item.css("line-height", w.titleLineHeight);
			item.css("z-index", w.bTitleAbove * 2 -1);

			setTxtPosDim(item, 
				w.windowL + w.windowW/2 - $( logo ).width()/2,
				w.titleSizePx*w.titleTopOffset + w.headerPx);
			
			if (!bLayoutOnly) item.fadeIn({queue: false, duration: w.fadeMs});

		} else { // all other menu items

			// only set the sizes for now
			item.css("font-size", w.titleSizePx * w.menuSizeFrac * (element[0]=="and" ? andFrac : 1));
			// item.css("letter-spacing", );
			item.css("line-height", w.titleLineHeight);
			item.css("z-index", w.bTitleAbove * 2 -1);

			menuItems.push( item );
			menuWidth += item.width();

			if (item.attr("id") != "and") {
				// on hovering over these items, they become darker
				var fadeFrac = 0.4;
				setupAnimateOnHover(  	// will this be duplicated? [BUG] ?
					[ menu[element[0]]["txt"] ], 
					menu[element[0]], 
					[ menu[element[0]]["txt"] ], 
					"queue_" + $(menu[element[0]]["txt"]).attr("id"), 
					{color: w.menuColorClick}, 
					w.fadeMs * fadeFrac, 
					0, 
					{color: w.menuColor}, 
					w.fadeMs * fadeFrac, 
					0);
			}
		}
	});

	var xOffset = w.windowL + w.windowW/2 - menuWidth/2;
	var ty = $(menu["logo"]["txt"]).offset().top + $(menu["logo"]["txt"]).height();
	$.each(menuItems, function(index, item) {

		// Layout the menu items
		var thisY = ty + item.height() * (item.attr("id")=="and" ? 0.2/andFrac*andOffsetMult : 0.2);
		setTxtPosDim(item,
			xOffset,
			thisY );

		if (!bLayoutOnly) item.fadeIn({queue: false, duration: w.fadeMs}); 

		xOffset += item.width();
	});

	if (bNewsHeadline) {
		// Fade in the bar
		$( icon_news["div"] ).css("background-color", "#f4f4f4");
		$( icon_news["div"] ).css("color", "#999999");
		$( icon_news["div"] ).css("font-family", fonts["body"]);
		$( icon_news["div"] ).attr("align", "center");
		$( icon_news["div"] ).css("font-size", w.headerPx * 0.5);
		$( icon_news["div"] ).css("letter-spacing", (w.bodyLetterSpacing*w.headerPx * 0.5) + "px"); // .1993
		$( icon_news["div"] ).css("padding", w.headerPx * 0.15);
		// $( icon_news["div"] ).css("font-size", w.titleSizePx * w.menuSizeFrac*0.8);
		// $( icon_news["div"] ).css("padding", w.titleSizePx * w.menuSizeFrac*0.8*0.2);
		icon_news["div"].style.width = "100%";
		icon_news["div"].style.height = w.headerPx;
		$( icon_news["div"] ).css("top", 0);
		$( icon_news["div"] ).css("left", 0);
		// $( icon_news["div"] ).css("line-height", ig_size/2 - w.titleSizePx*w.menuSizeFrac/2.0);
		// $( icon_news["div"] ).attr("height", ig_size);	
		if (!bLayoutOnly) $( icon_news["div"] ).fadeIn({queue: false, duration: w.fadeMs});

		// Fade in the text
		$(icon_news["txt"]).css("color", "#999999");
		$(icon_news["txt"]).css("font-family", fonts["body"]);
		$(icon_news["txt"]).css("font-size", w.headerPx * 0.5);
		$(icon_news["txt"]).css("letter-spacing", (w.bodyLetterSpacing*w.headerPx * 0.5) + "px"); // .1993
		setTxtPosDim($(icon_news["txt"]),
			w.windowL + w.windowW/2 - $(icon_news["txt"]).width()/2,
			w.headerPx/2 - $(icon_news["txt"]).height()/2*0.95);
		if (!bLayoutOnly) $( icon_news["txt"] ).fadeIn({queue: false, duration: w.fadeMs});

		console.log(w.headerPx, $(icon_news["txt"]).height());

		// still some bug that lays out the text incorrectly
	}

	// Fade in the icons
	// ig_size = w.titleSizePx * 0.5;
	ig_size = w.headerPx * 0.8;
	ig_padding = ig_size * 0.2;
	scrollSize = w.onMobile ? 0 : 15;  // size of the scroll bar
	$( icon_ig["img"] ).attr("width", ig_size);
	$( icon_ig["img"] ).attr("height", ig_size);				
	$( icon_ig["img"] ).css("top", ig_padding);
	// $( icon_ig["img"] ).css("left", w.windowW + w.windowL - w.marginSidePx - ig_size); // inline
	$( icon_ig["img"] ).css("left", $( window ).width() - scrollSize - ig_size - ig_padding ); //- ig_size - ig_padding); 
	$( icon_ig["img"] ).css("z-index", 1);
	$( icon_ig["img"] ).fadeIn({queue: false, duration: w.fadeMs});
	// Possible solution to changing color in JS: 
	// https://stackoverflow.com/questions/24933430/img-src-svg-changing-the-fill-color

}
function showHome(bLayoutOnly=false) {

	anticipatePageHeightAndScroll();

	// Create the foundation for an image layout
	if (w.onMobile) {
		var colWidth = (1 - (w.marginSideFrac*2)) * w.windowW;
		var layout = new MobileLayout(colWidth);
	} else {
		var colWidth = (1 - (w.marginSideFrac*2+w.marginBetweenFrac)) * w.windowW / 2.0;
		var layout = new DesktopLayout(2, colWidth, w.marginBetweenPx, 1);
	}

	// For each project ...
	var prevDoneAnimating = null;
	var prevDoneLayout = null;
	var bDelay = bLayoutOnly ? 0 : 1;
    $.each(projects, function(index, element) {

    	// Make promises 
    	var thisDoneLoading = $.Deferred();
    	$( element["img"] ).on( "load", function () { thisDoneLoading.resolve(); });

    	var thisDoneLayout = $.Deferred();
    	var moveAmtPx = previouslyVisited() ? 0 : w.moveAmtPx;
    	var delayFrac = previouslyVisited() ? 0.7 : 1.0;
		var layoutImage = function() {

			var origRect = layout.getImagePosition($( element["img"] ).width(), $( element["img"] ).height());
			var thisRect = origRect.getCopy();
			// transform this rectangle into the screen's coordinate system
			thisRect.transform(w.windowL + w.marginSidePx, w.marginTopPx + w.headerPx);

			// Set the image attributes
			$( element["img"] ).attr("width", thisRect.w);
			$( element["img"] ).attr("height", thisRect.h);				
			$( element["img"] ).css("top", thisRect.y + moveAmtPx);
			$( element["img"] ).css("left", thisRect.x); 
			$( element["img"] ).css("z-index", 0);

			// Set the text attributes
			$( element["txt"] ).css("font-size", w.fontSizePx);
			$( element["txt"] ).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx) + "px"); // .1993
			$( element["txt"] ).css("z-index", 0);
			// set position
			setTxtPosDim( 
				$( element["txt"] ), 
				thisRect.x, 
				thisRect.b() + w.fontSizePx*0.55 + moveAmtPx, 
				colWidth);

			// if mobile, add the text offset
			if (w.onMobile) {
				layout.addOffset(0, $( element["txt"] ).height());
			}

			// On hovering over the image, show the text below it
			// (this has been extensively tested -- this works really well!)
			var hoverQueueName = "hover";
			var sensorIDs = "#" + element["img"]["id"] + ", " + "#" + element["txt"]["id"];
			var timeoutMs = 0; // 2500
			var fadeFrac = 0.5;
			$( sensorIDs ).mouseenter( function() {
				if (element["timeout"]) {
		    		for (var i = 0; i < element["timeout"].length; i++) clearTimeout(element["timeout"][i]);
		    		element["timeout"] = [];
		    	} else element["timeout"] = [];
				$( element["txt"] ).stop(hoverQueueName, true, false).animate({color: w.dark}, {queue: hoverQueueName, duration: w.fadeMs*fadeFrac}).dequeue(hoverQueueName);
		    });
		    $( sensorIDs ).mouseleave( function() {
		    	if (element["timeout"]) {
		    		for (var i = 0; i < element["timeout"].length; i++) clearTimeout(element["timeout"][i]);
		    		element["timeout"] = [];
		    	} else element["timeout"] = [];
		    	var to = setTimeout( function() {
		    		$( element["txt"] ).stop(hoverQueueName, true, false).animate({color: w.light}, {queue: hoverQueueName, duration: w.fadeMs*fadeFrac}).dequeue(hoverQueueName);
				}, timeoutMs);
				element["timeout"].push(to);
		    });

		    // flag layout as complete
		    thisDoneLayout.resolve(); 
		};

		var thisDoneAnimating = $.Deferred();
		var animateImage = function() {

			if (!bLayoutOnly) {
				// at the end of fading in, save the page height
				$( element["img"] ).fadeIn({queue: false, duration: w.fadeMs});
				$( element["img"] ).animate({top: "-="+moveAmtPx}, {duration: w.moveMs, easing: "easeOutCubic"});

				// $( element["txt"] ).css("opacity", 0.5);
				$( element["txt"] ).fadeIn({queue: false, duration: w.fadeMs}); 
				// $( element["txt"] ).animate({opacity: 0.5}, {queue: false, duration: w.fadeMs});
				$( element["txt"] ).animate({top: "-="+moveAmtPx}, {duration: w.moveMs, easing: "easeOutCubic"});
			}

			// Load logo text
			if (index == 0) {
				showMenuItems(bLayoutOnly);
			}

			setTimeout( function() { thisDoneAnimating.resolve(); }, Math.max(w.moveMs, w.fadeMs)*bDelay);
		};

		// When this image is done loading and the previous image is done laying out, lay this out
		$.when( thisDoneLoading, prevDoneLayout ).done( layoutImage ).promise();

		// When this image is done laying out, animate it after a brief pause
		$.when( thisDoneLayout ).done( function() { setTimeout( animateImage, w.delayDisplayMs*delayFrac*bDelay ); }).promise();

		// When the final image is done animating, set the height of the body a little bit higher
		if (index == projects.length-1) {
			$.when( thisDoneAnimating ).done( finishPageLayout ).promise();
		}

		// Stagger image loading so everything loads faster
		var startLoading = function() { $( element["img"] ).attr( 'src', $( element["img"] ).attr( 'src-tmp' ) ); };
    	setTimeout( startLoading, index * w.delayLoadingMs * delayFrac * bDelay);

    	// Save these promises
	    prevDoneLayout = thisDoneLayout;
	    prevDoneAnimating = thisDoneAnimating;
    });
}
function showAbout(bLayoutOnly=false) {

	// Desktop Params
	var columnFrac = 0.6;
	var img2txtWidthFrac = 0.35;
	var marginFrac = 0.025;

	// Mobile params
	// var mobileMarginFrac = 0.025;
	var imgWidthFrac = 0.7;
	var txtWidthFrac = 0.7;
	var vertMarginFrac = 0.07;

	var bDelay = bLayoutOnly ? 0 : 1;

	// Should the desktop photo be centered in the text or at the top?
	// var bDesktopImgTop = true; // not implemented

	anticipatePageHeightAndScroll();

	var loadAbt = function(def) {
		beginLoadingImg( about["img"] );
		$( about["img"] ).on("load", function() { def.resolve(); });
	};
	var layoutAbt = function(def) {

		var layoutAbtMobile = function() {

			var imgWidthPx = w.f2p(imgWidthFrac);
			var imgHeightPx = getNewImageHeight(about["img"], imgWidthPx);
			setImgPosDim( 
				$(about["img"]), 
				w.windowL + w.f2p(1-imgWidthFrac)/2.0, 
				w.marginTopPx + w.headerPx + w.f2p(vertMarginFrac)/2, 
				imgWidthPx, 
				imgHeightPx);

			$(about["txt"]).css("font-size", w.fontSizePx);
			$(about["txt"]).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*0.8) + "px"); // .1993
			$(about["txt"]).css("line-height", w.bodyLineHeight + "px"); // .1993

			setTxtPosDim(
				$(about["txt"]),
				w.windowL + w.f2p(1-txtWidthFrac)/2.0,
				w.marginTopPx + w.headerPx + w.f2p(vertMarginFrac)/2 + imgHeightPx + w.f2p(vertMarginFrac), // plus more
				w.f2p(txtWidthFrac));


			// Footer info:
			var footerFontFrac = 0.8;
			$(about["ftr"]).css("font-size", w.fontSizePx*footerFontFrac);
			$(about["ftr"]).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*1.4) + "px"); // .1993
			$(about["ftr"]).css("line-height", w.bodyLineHeight + "px"); // .1993
			$(about["ftr"]).css("text-align", "center");

			var contentBottom = Math.max(
				parseInt($(about["txt"]).css("top"),10) + $(about["txt"]).height(), 
				parseInt($(about["img"]).css("top"),10) + $(about["img"]).height()) + w.f2p(w.footerFrac)*2;
			var pageBottom = $(window).height() - $(about["ftr"]).height() - w.f2p(w.footerFrac)*1;
			var ftrY = Math.max(contentBottom, pageBottom)

			setTxtPosDim(
				$(about["ftr"]),
				$(window).width()/2 - $(about["ftr"]).width()/2,
				ftrY);

			def.resolve();
		}

		var layoutAbtDesktop = function() {

			// Set the location of all elements
			var colWidthPx = w.f2p(columnFrac);
			var imgWidthPx = img2txtWidthFrac * (colWidthPx * (1-marginFrac));
			var marginWidthPx = w.f2p(marginFrac);
			var txtWidthPx = colWidthPx - (imgWidthPx+marginWidthPx);
			var sideMarginPx = w.f2p(1-columnFrac) / 2.0;

			// Set the location of the text
			$(about["txt"]).css("font-size", w.fontSizePx);
			$(about["txt"]).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*0.8) + "px"); // .1993
			$(about["txt"]).css("line-height", w.bodyLineHeight + "px"); // .1993

			setTxtPosDim(
				$(about["txt"]),
				w.windowL + sideMarginPx + imgWidthPx + marginWidthPx,
				0,
				txtWidthPx);
			setTxtPosDim(
				$(about["txt"]),
				null,
				Math.max(($(window).height()-w.headerPx)/2 - $(about["txt"]).height()/2 + w.headerPx, w.marginTopPx + w.headerPx)); // [Changed]

			// Set the location of the image
			var imgHeightPx = getNewImageHeight(about["img"], imgWidthPx);
			var vertCenter = Math.max( ($(window).height()-w.headerPx)/2 - imgHeightPx/2 + w.headerPx, w.marginTopPx + w.headerPx);
			setImgPosDim( 
				$(about["img"]), 
				w.windowL + sideMarginPx, 
				Math.max(vertCenter, w.marginTopPx + w.headerPx), //w.marginTopPx), // [ Changed ]
				imgWidthPx, 
				imgHeightPx);

			// Set the location of the footer
			var footerFontFrac = 0.8;
			$(about["ftr"]).css("font-size", w.fontSizePx*footerFontFrac);
			$(about["ftr"]).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*0.8*footerFontFrac) + "px"); // .1993
			$(about["ftr"]).css("line-height", w.bodyLineHeight + "px"); // .1993
			$(about["ftr"]).css("text-align", "center");

			var contentBottom = Math.max(
				parseInt($(about["txt"]).css("top"),10) + $(about["txt"]).height(), 
				parseInt($(about["img"]).css("top"),10) + $(about["img"]).height()) + w.f2p(w.footerFrac)*1.1;
			var pageBottom = $(window).height() - $(about["ftr"]).height() - w.f2p(w.footerFrac)*1;
			var ftrY = Math.max(contentBottom, pageBottom)

			setTxtPosDim(
				$(about["ftr"]),
				$(window).width()/2 - $(about["ftr"]).width()/2,
				ftrY);

			def.resolve();
		}

		if (w.onMobile) layoutAbtMobile();
		else layoutAbtDesktop();
	};
	var animateAbt = function(def) {

		var displayOffsetMs = 150;
		var fadeFrac = 0.6; // compared to home

		// show all items
		setTimeout( function() { return showMenuItems(bLayoutOnly); }, 0 * displayOffsetMs * bDelay);
		var animateImg = function() { 
			if (!bLayoutOnly) $(about["img"]).fadeIn({queue:false, duration: w.fadeMs * fadeFrac}); 
		};
		setTimeout( animateImg , 1 * displayOffsetMs * bDelay);
		var animateTxt = function() { 
			if (!bLayoutOnly) $(about["txt"]).fadeIn({queue:false, duration: w.fadeMs * fadeFrac}); 
			if (!bLayoutOnly) $(about["ftr"]).fadeIn({queue:false, duration: w.fadeMs * fadeFrac+bDelay*displayOffsetMs}); 
			def.resolve(); 
		};
		setTimeout( animateTxt , 1.5 * displayOffsetMs * bDelay);
	};

	return consecCall( [loadAbt, layoutAbt, animateAbt, finishPageLayout] );
}
function showInquire(bLayoutOnly=false) {

	var bDelay = bLayoutOnly ? 0 : 1;

	anticipatePageHeightAndScroll();

	var layoutInq = function(def) {

		$(inquire["txt"]).css("font-size", w.fontSizePx);
		$(inquire["txt"]).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*0.8) + "px"); // .1993
		$(inquire["txt"]).css("line-height", w.bodyLineHeight*1.5 + "px"); // .1993
		$(inquire["txt"]).css("text-align", "center");

		setTxtPosDim(
			$(inquire["txt"]),
			0,
			0,
			$(window).width());

		setTxtPosDim(
			$(inquire["txt"]),
			0,
			Math.max(($(window).height()-w.headerPx)/2 - $(inquire["txt"]).height()/2 + w.headerPx, w.marginTopPx + w.headerPx));

		def.resolve();
	};
	var animateInq = function(def) {

		var displayOffsetMs = 150;
		var fadeFrac = 0.6; // compared to home

		// show all items
		setTimeout( function() { return showMenuItems(bLayoutOnly); }, 0 * displayOffsetMs * bDelay);
		var animateTxt = function() { 
			if (!bLayoutOnly) $(inquire["txt"]).fadeIn({queue:false, duration: w.fadeMs * fadeFrac}); 
			def.resolve(); 
		};
		setTimeout( animateTxt , 1 * displayOffsetMs * bDelay);
	};

	return consecCall( [layoutInq, animateInq, finishPageLayout] );
}
function showProject(bLayoutOnly=false) {

	anticipatePageHeightAndScroll();

	// Choose whether to load the next image set once the entire previous 
	// image set is loaded, or only once the first image in the previous 
	// image set has loaded
	// var bWaitForEntireSet = true;

	var bAnimate = false;
	var moveFrac = 0.6; // compared to home
	var delayFrac = 0.65;
	var delayTextMs = 120;


	// Determine how wide to make the images and how wide to make the text
	var img2textWidthFrac = 0.6;
	var marginFrac = 0.025;
	var imgVertMarginFrac = 0.025;
	
	var imgWidthFrac = (1-(w.marginSideFrac*2+(w.onMobile?0:marginFrac))) * (w.onMobile ? 1 : img2textWidthFrac);
	var textWidthFrac = (1-(w.marginSideFrac*2+(w.onMobile?0:marginFrac))) * (w.onMobile ? 1 : (1-img2textWidthFrac));
	var imgWidthPx = w.f2p( imgWidthFrac );
	var textWidthPx = w.f2p( textWidthFrac );
	var marginPx = w.f2p( marginFrac );
	var imgVertMarginPx = w.f2p( imgVertMarginFrac );
	var delayLoadingMs = w.delayLoadingMs * delayFrac;
	var delayDisplayMs = w.delayDisplayMs * delayFrac;
	var bDelay = bLayoutOnly ? 0 : 1;

	// Draw all images and load text with the first image set
	var prevDoneAnimating = null;
	var prevDoneLayout = null;
	var prevBeginsAnimating = null;
	var topOffsets = [w.marginTopPx + w.headerPx + (bAnimate ? w.moveAmtPx : 0)]; // offsets (not including the top margin) for each image set
	// var topOffset = 0; // doesn't include top margin
	$.each(project["images"], function(index, _element) {

		var element = isArray(_element) ? _element : [_element];

		// Loading promises
		var thisDoneLoading = [];
		$.each(element, function(i, e) {
			var def = $.Deferred(); thisDoneLoading.push(def);
			$( e["img"] ).on("load", function() { def.resolve(); });
		});
		
		// Layout promises
		var thisDoneLayout = $.Deferred();
		$.each(element, function(i, e) {

			var layoutImage = function() {

				// size of the first image
				var xOffset = 0;
				var yOffset = 0;

				// set the title, date, description location
				var tx = 0, ty = 0, tw = 0, th = 0;
				var layoutProjectText = function() {

					// don't setup this project text 
					if (!(index == 0 && i == 0)) return;

					tx = w.windowL + w.marginSidePx + xOffset;
					ty = topOffsets[index];
					tw = textWidthPx;

					// title
					var title = $( project["text"][0]["txt"] );
					title.css("font-size", w.titleSizePx * w.subheadingSizeFrac);
					title.css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx) + "px"); // .1993
					setTxtPosDim(title, tx, ty, tw, null);
					ty += title.height() + w.fontSizePx * 0.1;

					// role
					var mat = $( project["text"][1]["txt"] );
					mat.css("font-size", w.titleSizePx * w.subheadingSizeFrac * 0.7);
					mat.css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx * 0.7) + "px");
					setTxtPosDim(mat, tx, ty, tw, null);
					ty += mat.height() + w.fontSizePx * 0.1;

					// date
					var date = $( project["text"][2]["txt"] );
					date.css("font-size", w.titleSizePx * w.subheadingSizeFrac * 0.7);
					date.css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx * 0.7) + "px");
					setTxtPosDim(date, tx, ty, tw, null);
					ty += date.height() + w.fontSizePx * 1.4;

					// description
					var desc = $( project["text"][3]["txt"] );
					desc.css("font-size", w.fontSizePx);
					desc.css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*0.8) + "px"); // .1993
					desc.css("line-height", w.bodyLineHeight + "px"); // .1993
					setTxtPosDim(desc, tx, ty, tw, null);
					ty += desc.height();

					if (w.onMobile) {	// mobile
						// x doesn't change	
						yOffset += (ty-topOffsets[index]) + imgVertMarginPx*1.8;
					} else {			// desktop
						// x doesn't change
						// y doesn't change
					}
				}
				
				// Set the x, y, w, h
				var ix = 0, iy = 0, iw = 0, ih = 0;
				var layoutFirstImage = function() {

					// if (!(i == 0)) return;

					// Determine the position and dimensions of the image
					ix = w.windowL + w.marginSidePx;
					if (w.onMobile) iy = yOffset + topOffsets[index] + imgVertMarginPx*2;
					else iy = yOffset + topOffsets[index]; 
					
					iw = imgWidthPx;
					ih = $(e["img"]).height() / $(e["img"]).width() * iw;

					// Set the image position
					setImgPosDim( $( e["img"] ), ix, iy, iw, ih);

					// Lastly, set the priority of sets overlapping (higher numbers = further above)
					$( e["img"] ).css("z-index", 0);	

					if (w.onMobile) { 	// mobile
						// x doesn't change
						yOffset += ih + imgVertMarginPx*2;
					} else { 			// desktop
						xOffset += iw + w.f2p( marginFrac );
						yOffset += ih + imgVertMarginPx;
					}
				}

				// setup image first on desktop or the text first on mobile
				if (w.onMobile) {
					layoutProjectText(); layoutFirstImage();
				} else {
					layoutFirstImage(); layoutProjectText(); 
				}
				
				// At the last image in a set, make the set flippable
				// This should be the first image in the set (i.e. "(element.length > 1 && i == 1)"
				// but artifacts result from the second image being shown before it is laid out completely; thus,
				// a quick fix is to wait for all in a set to load before offerring flippability
				if (element.length > 1 && i == 0) {

					// First, create clickable divs
					var rct = new rect(ix, iy, iw, ih); 
					var divR = getDivElement(index + "_rightButton", "", ["async"], "e-resize");
					// setTxtPosDim( $(divR), rct.x + rct.w/3*2, rct.y, rct.w/3, rct.h); // 1/3
					setTxtPosDim( $(divR), rct.x + rct.w/2, rct.y, rct.w/2, rct.h); // 1/2
					var divL = getDivElement(index + "_leftButton", "", ["async"], "w-resize");
					// setTxtPosDim( $(divL), rct.x, rct.y, rct.w/3, rct.h); // 1/3
					setTxtPosDim( $(divL), rct.x, rct.y, rct.w/2, rct.h); // 1/2
					
					// Then, on click of these divs:
					// imgSet: array of images (with one visible)
					// offset: -1 is left, +1 is right
					var showNextImage = function(imgSet, imgOffset) {

						// First, find the image in this set that's visible
						var visImg = null;
						var visImgIndex = -1;
						for (var i = 0; i < imgSet.length; i++) {

							if ($(imgSet[i]["img"]).is(":visible")) {
								visImg = imgSet[i]["img"];
								visImgIndex = i;
								break;
							}
						}
						if (visImg == null) return;

						// Set the z-index of this image to 0
						$( visImg ).css("z-index", 0);

						// Find the next image
						var nextImgIndex = (visImgIndex+imgOffset+imgSet.length)%imgSet.length;
						var nextImg = imgSet[nextImgIndex]["img"];

						// Set the z-index of the next image to something lower
						$( nextImg ).css("z-index", -1);

						// Show the next image
						var queueName = "flip";
						var flipMs = 200;
						$( nextImg ).stop(true, false).fadeIn({queue: queueName, duration: flipMs}).dequeue(queueName);
						// Fade out the top image
						$( visImg ).stop(true, false).fadeOut({queue: queueName, duration: flipMs}).dequeue(queueName);
					};
					onTapFn( divR,  function() { return showNextImage(element, 1)});
					onTapFn( divL,  function() { return showNextImage(element, -1)});
				}

				// If it's the first, set a promise
				if (i == 0) {
					
					// If there are captions, set their layout here
					var captionOffset = 0;
					var layoutCaption = function() {
						var caption = null;
						$.each(element, function(ii, ee) {
							if (ee["caption"]) caption = ee["caption"];
						});
						if (caption != null) {

							$(caption).css("font-size", w.fontSizePx*0.9);
							$(caption).css("letter-spacing", (w.bodyLetterSpacing*w.fontSizePx*0.8) + "px"); // .1993
							$(caption).css("line-height", w.bodyLineHeight*0.9 + "px"); // .1993 // [ is mult too big ? ] [ DIFF ]

							$(caption).css("width", iw);
							$(caption).css("text-align", "center");

							// var addlCaptionOffset = $(caption).height() * 0.2; // This gets too large with large captions, so do this instead:
							var addlCaptionOffset = w.fontSizePx * 0.536; // $(caption).height() * 0.2
							setTxtPosDim( $(caption), ix+iw/2-$(caption).width()/2, iy+ih+addlCaptionOffset);
							captionOffset += $(caption).height() + addlCaptionOffset;
							yOffset += captionOffset;
						}
					}
					layoutCaption();

					// Store the offset for this image
					topOffsets.push( topOffsets[topOffsets.length-1] + yOffset);
					if (w.onMobile && i == 0 && index == 0) topOffsets[0] = iy - imgVertMarginPx*2;
					
					// resolve promise
					thisDoneLayout.resolve();
				}
			}
			
			var promises = [ thisDoneLoading[i], (i==0 ? prevDoneLayout : thisDoneLayout) ];
			$.when( ... promises ).done( layoutImage ).promise();
		});
		
		// Animation Promises
		var thisDoneAnimating = $.Deferred(); 
		var thisBeginsAnimating = $.Deferred(); // need this because it takes time to layout videos
		var animateFirstImage = function() {

			thisBeginsAnimating.resolve();

			// animate the image
			if (!bLayoutOnly) {
				setTimeout( function() {
					$( element[0]["img"] ).fadeIn({queue: false, duration: w.fadeMs*moveFrac}); 
					if (bAnimate) $( element[0]["img"] ).animate({top: "-="+w.moveAmtPx}, w.moveMs*moveFrac, "easeOutCubic");
				}, 	(w.onMobile ? delayTextMs : 0) * bDelay);


				if (index == 0) {
					// animate the text
					var showText = function() {
						$.each(project["text"], function(i, e) {
							$( e["txt"] ).fadeIn({queue: false, duration: w.fadeMs*moveFrac}); 
							if (bAnimate) $( e["txt"] ).animate({top: "-="+w.moveAmtPx}, w.moveMs*moveFrac, "easeOutCubic");
						});
					}
					setTimeout(showText, (w.onMobile ? 0 : delayTextMs) * bDelay);
				}

				// If there's a caption, animate it, too
				var animateCaption = function() {
					var caption = null;
					$.each(element, function(ii, ee) {
						if (ee["caption"]) caption = ee["caption"];
					});
					if (caption != null) {
						$(caption).fadeIn({queue: false, duration: w.fadeMs*moveFrac});
					}
				}
				animateCaption();
			}

			// resolve this promise
			setTimeout( function() { thisDoneAnimating.resolve(); }, Math.max(w.moveMs*moveFrac, w.fadeMs*moveFrac) * bDelay);
		};
		$.when( thisDoneLayout, prevBeginsAnimating ).done( function() { setTimeout( animateFirstImage, delayDisplayMs * bDelay ); }).promise();

		if (index == 0) {
			$.when( thisDoneLayout ).done( function() { setTimeout( function() { return showMenuItems(bLayoutOnly); }, Math.max(delayDisplayMs-delayTextMs,0) * bDelay ); }).promise();
		}

		if (index == project["images"].length-1) {
			$.when( thisDoneAnimating ).done( finishPageLayout ).promise();
		}

		// Stagger image loading so everything loads faster
		$.each(element, function(i, e) {
			var startLoading = function() { $( e["img"] ).attr( 'src', $( e["img"] ).attr( 'src-tmp' ) ); };
			setTimeout( startLoading, (index*delayLoadingMs + i*delayLoadingMs/(element.length+1)) * bDelay );
		});

    	// Save these promises
	    prevDoneLayout = thisDoneLayout;
	    prevDoneAnimating = thisDoneAnimating;
	    prevBeginsAnimating = thisBeginsAnimating;
	});
}
function showAllItems(pageID, bLayoutOnly=false) {
	if (pageID == "home") {
		showHome( bLayoutOnly );
	} else if (pageID == "about") {
		showAbout( bLayoutOnly );
	} else if (pageID == "inquire") {
		showInquire( bLayoutOnly );
	} else {
		showProject( bLayoutOnly );
	}
}
function show(pageID, bLayoutOnly=false) {

	// recompute all parameters
	w.recompute();

	// Set the page title
	if (!bLayoutOnly) setPageTitle(pageID);

	// show all items
	showAllItems(pageID, bLayoutOnly);
}

// load a specific page within this domain (no fadeout!)
function loadPage(pageID="", fadeOutDone=null) {

	// Get the pageID if not specified
	if (pageID=="") pageID = getThisPage();

	// First, initialize all elements
	var initDone = $.Deferred();
	init(pageID, initDone);

	// When all items have been initialized, show all items
	$.when( initDone, fadeOutDone ).done( function(){ return show(pageID);} ).promise();
}

// exit current page and load a new one (pageID);
function exitAndLoad(pageID) {

	// fade out and delete all elements
	var fadeOutDone = fadeOut();

	// load the new page
	loadPage(pageID, fadeOutDone);
}

function loadURL(toUrl) {

	if (toUrl.includes(mailKey) ) {

		window.open(toUrl, '_blank');

	} else if (toUrl.includes(domainKey)) {
		// Get the page ID
		var pageID = getPage(toUrl);

		// Reset the scrollTop
		markPageUnvisited(pageID);

		// Change the state of the page
		if (getThisPage() == pageID) return;
		if (getThisPage() == "home") {
			// if (pageID == "home") return;
			// else history.pushState( {}, "", pageID );
			history.pushState( {}, "", pageID );
		} else {
			if (pageID == "home") history.pushState( {}, "", "../");
			else history.pushState( {}, "", "../"+pageID);
		}
		exitAndLoad( pageID );

	} else {
		// fade out
		// fadeOut(true);
		// load an external url
		window.open(toUrl, '_blank');
		// window.location.href = toUrl;		
	}
}

var windowReady = $.Deferred();
$( document ).ready(function() { 
	windowReady.resolve(); 
});

var windowLoaded = $.Deferred();
$( window ).on("load", function() { 
	windowLoaded.resolve(); 
});

// When the window is ready, initialize fonts and load the page
$.when( windowReady, windowLoaded ).done( loadFonts, loadIcons, loadPage ).promise();

// load new page if the forward or back button is pressed
$( window ).on('popstate', function() {

	// setScrollTop(

	// Get the current url
	var url = window.location.href;
	// Parse the specific page
	var pageID = getPage(url);
	// todo: Check if this page exists
	
	exitAndLoad( pageID );
});

$( window ).scroll( function() {
	saveThisScrollTop();
});

// resize a page by re-laying out all items
function resizePage() {
	show(getThisPage(), true);
}

var lastResizeMs = 0;
var resizeDebounceMs = 200;
$( window ).on( "resize", function() {
	var thisTime = getTimeMs();
	lastResizeMs = thisTime;
    setTimeout( function() {
    	if (thisTime == lastResizeMs) {
    		resizePage();
    	}
    }, resizeDebounceMs);
});

// [BUG] This still doesn't work
$( window ).on("orientationchange", function() {
	// wait for window to change completely (this works most of the time, but isn't foolproof)
	// ref: https://stackoverflow.com/questions/12452349/mobile-viewport-height-after-orientation-change
	setTimeout( function() { 
		return resizePage();
	}, 200);
});