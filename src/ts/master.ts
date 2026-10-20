import Swiper from "swiper";
import { Parallax, Navigation, Pagination } from "swiper/modules";
import { SwiperOptions } from "swiper/types";
import $ from "jquery";
import * as M from "materialize-css";

let historySwiper: Swiper;
let historySliderEl: HTMLElement;
let resizeTimeout: number | null | NodeJS.Timeout;
let sidenav: M.Sidenav[];

interface INewsEntry{
	id: number,
	date: string,
	image: string,
	title: string,
	body: string
}

let news: Array<INewsEntry>;

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

	document.querySelectorAll('.dot').forEach(dot => {
		dot.addEventListener('click', e => {
			const el = e.currentTarget as HTMLElement;
			const slideNum = parseInt(el.dataset.slide || "-1");
			
			if(slideNum > 0){
				historySwiper.slideTo(slideNum - 1);
			}
		})
	})

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

	fetch('./kubgau-tulpanomagic/data/news.json')
		.then(res => res.json())
		.then(response => {

			news = response;

			const newsSliderEl = document.getElementById('news-slider');
			const newsContainer = document.getElementById('news-container');

			if(!newsContainer || !newsSliderEl) return;

			newsContainer.innerHTML = "";

			news.forEach((entry:INewsEntry) => {

				const newsCard = `<div class="news-card" data-id="${entry.id}">
					<div class="news-card__header">
						<div class="news-card__header-text">${entry.date}</div>
					</div>
					<div class="news-card__image">
						<img width="700" height="400" src="${entry.image}">
					</div>
					<div class="news-card__title">${entry.title}</div>
				</div>`;

				const slide = document.createElement("div");
				slide.className = "swiper-slide";
				slide.innerHTML = newsCard;

				newsContainer?.append(slide);
				newsSliderEl.classList.remove('loading');

				const newsSlider = new Swiper(newsSliderEl, {
					slidesPerView: 3,
					spaceBetween: 20,
					breakpoints: {
						200: {
							slidesPerView: 1
						},
						900: {
							slidesPerView: 2
						},
						1400: {
							slidesPerView: 3
						}
					}
				});

				document.querySelectorAll('.news-card').forEach(card => {
					card.addEventListener('click', openNewsModal);
				})
			});
		});
});

function openNewsModal(e:Event){
	const el = e.currentTarget as HTMLElement;
	const newsId = parseInt(el.dataset.id || "-2");

	document.querySelectorAll('.modal-wrapper').forEach(el => {
		el.remove();
	})

	if(newsId > 0){
		const entry:INewsEntry = news.filter(e => e.id == newsId)[0];
		console.log(entry.title);

		const modalEl = `<div class="modal">
			<div class="modal-header">${entry.date}</div>
			<div class="modal-image">
				<div class="title">${entry.title}</div>
				<img src="${entry.image}" width="700" height="400">
			</div>
			<div class="modal-content">
				${entry.body}
			</div>
			<div class="modal-footer"></div>
		</div>`;

		const modalWrapper = document.createElement('div');
		modalWrapper.className = "modal-wrapper";
		modalWrapper.innerHTML = modalEl;

		const closeBttn = document.createElement("a")
		closeBttn.textContent = "Закрыть";
		closeBttn.href = "javascript:void(0);"
		closeBttn.className = "bttn";
		closeBttn.addEventListener('click', e => {
			e.preventDefault();
			document.body.classList.add('animating');
			modalWrapper.classList.remove('open');
			setTimeout(() => {
				modalWrapper.remove();
				document.body.classList.remove('animating');
			}, 200);
		});

		modalWrapper.querySelector('.modal-footer')?.append(closeBttn);

		modalWrapper.addEventListener('click', e => {
			const path = Array.from(e.composedPath());

			const filtered = path.filter(element => {
				const el = element as HTMLElement;
				if(el.classList){
					return el.classList.contains('modal');
				}
			})

			if(!filtered.length){
				document.body.classList.add('animating');
				modalWrapper.classList.remove('open');
				setTimeout(() => {
					modalWrapper.remove();
					document.body.classList.remove('animating');
				}, 200);
			}
		})

		document.body.append(modalWrapper);
		setTimeout(() => {
			modalWrapper.classList.add('open');
		})

	}
}

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
