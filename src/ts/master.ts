import Swiper from "swiper";
import { Parallax, Navigation, Pagination } from "swiper/modules";
import { SwiperOptions } from "swiper/types";
import $ from "jquery";
import * as M from "materialize-css";

let historySwiper: Swiper;
let historySliderEl: HTMLElement;
let resizeTimeout: number | null | NodeJS.Timeout;
let sidenav: M.Sidenav[];

Swiper.use([Parallax, Navigation, Pagination]);

const historySwiperOptions: SwiperOptions = {
	slidesPerView: 4,
	speed: 500,
	centeredSlides: true,
	parallax: true,
	navigation: {
		nextEl: "#history-next",
		prevEl: "#history-prev",
	},
	pagination: {
		type: "bullets",
		el: "#history-pagination",
		dynamicBullets: true,
		dynamicMainBullets: 3,
		clickable: true,
	},
	breakpoints: {
		200: {
			slidesPerView: 1,
			autoHeight: true
		},
		480: {
			slidesPerView: 1,
			autoHeight: true
		},
		650: {
			slidesPerView: 6,
		},
		900: {
			slidesPerView: 8,
		},
	},
};

document.addEventListener("DOMContentLoaded", () => {
	historySliderEl = document.querySelector("#history-swiper") as HTMLElement;
	historySwiper = new Swiper(historySliderEl, historySwiperOptions);

	sidenav = M.Sidenav.init(document.querySelectorAll(".sidenav"), {
		edge: "right",
	});

	$(".title-wrapper").on("click", "h2", toggleMobileData);
	$("body").on("click", "svg [data-num]", switchDesktopSlide);
	$("body").on("click", ".scroll-link", smoothScrollTo);

	const currentDate = new Date();
	const year = currentDate.getFullYear();

	const yearEl = document.querySelector("#year");
	if (yearEl) yearEl.textContent = year.toString();
});

function smoothScrollTo(e: JQuery.ClickEvent) {
	e.preventDefault();
	const el = e.currentTarget as HTMLLinkElement;
	const href = el.href;
	const hrefUrl = new URL(href);
	const anchor = hrefUrl.hash;

	const target = $(anchor);
	let top = target.offset()?.top || 0;

	let offset = window.innerWidth <= 650 ? 75 : 100;

	let snInstance = sidenav[0];
	snInstance.close();

	if (anchor != "#top") top -= offset;

	$("html, body").animate(
		{
			scrollTop: top,
		},
		400,
	);
}

function switchDesktopSlide(e: JQuery.ClickEvent) {
	e.preventDefault();

	const el = e.currentTarget as HTMLElement;
	const slideNum = el.dataset["num"];

	$(".title-wrapper [data-slide]").removeClass("in-sight");
	$(".data-wrapper [data-slide]").removeClass("in-sight");
	$('.icons g').removeClass('active');
	$('.icons g[data-num="' + slideNum + '"]').addClass('active');
	$('.icons .animating').removeClass('animating');
	$('.data-wrapper').scrollTop(0);
	
	
	setTimeout(() => {
		$(".title-wrapper [data-slide]").removeClass("active");
		$(".data-wrapper [data-slide]").removeClass("active");
		
		$('.title-wrapper [data-slide="' + slideNum + '"]').addClass("active");
		$('.data-wrapper [data-slide="' + slideNum + '"]').addClass("active");

		
		setTimeout(() => {
			$('.title-wrapper [data-slide="' + slideNum + '"]').addClass(
				"in-sight",
			);
			$('.data-wrapper [data-slide="' + slideNum + '"]').addClass(
				"in-sight",
			);
			
			$('.icons .st1').addClass('animating');
			$('.icons .active .st1').removeClass("animating");

		}, 20);
	}, 200);
}

function toggleMobileData(e: JQuery.ClickEvent) {
	e.preventDefault();
	let $el = $(e.currentTarget);
	let $next = $el.next();
	let already = $el.hasClass("active");
	let slide = $el.data("slide");
	let newClass = already ? "" : "active in-sight";
	
	$(".title-wrapper .mobile-content").slideUp(0, () => {

		let elTop = $el.offset()?.top;
		
		$(".title-wrapper h2").removeClass("active");
	
		$el.addClass(newClass);
		$next.addClass(newClass);
	
		if (!already) {
			$next.slideDown(0, "", () => {
				$(".data-wrapper [data-slide]").removeClass("active");
				$('.data-wrapper [data-slide="' + slide + '"]').addClass(newClass);
	
				if (elTop) $("html, body").scrollTop(elTop - 65);
	
				setTimeout(() => {
					$next.addClass(newClass);
				}, 200);
			});
		}
	});

}

window.addEventListener("resize", () => {
	if (resizeTimeout) {
		clearTimeout(resizeTimeout);
	}

	resizeTimeout = setTimeout(() => {
		resizeTimeout = null;
		windowResizeComplete();
	}, 400);
});

function windowResizeComplete() {
	// Реинициализация слайдера истории
	historySwiper.destroy();
	historySwiper = new Swiper(historySliderEl, historySwiperOptions);
}
