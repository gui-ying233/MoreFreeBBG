// ==UserScript==
// @name         彭博查看更多
// @namespace    https://github.com/gui-ying233/MoreFreeBBG
// @version      1.0.0
// @description  去除彭博的订阅提示并显示更多内容（不一定能完全显示）
// @author       鬼影233
// @license      MIT
// @match        https://www.bloomberg.com/*
// @exclude      https://www.bloomberg.com/toaster/*
// @icon         https://www.bloomberg.com/favicon-black.png
// @supportURL   https://github.com/gui-ying233/MoreFreeBBG/issues
// @run-at       document-idle
// ==/UserScript==

(() => {
	"use strict";
	document.head.appendChild(
		Object.assign(document.createElement("style"), {
			textContent:
				"#slidingSheet,div[class^='media-ui-Placeholder_placeholderParagraphWrapper']{display:none}body::before,nav[data-component=nav]::after{content:initial!important}html:not(#MoreFreeBBG),body:not(#MoreFreeBBG){overflow:initial!important;position:initial!important;height:initial!important;width:initial!important;pointer-events:initial!important}#__next>div>div[class^='media-ui-LeaderboardAd_parallaxWrapper']{height:initial;overflow-y:initial}div[class^='styles_articleBlur']{-webkit-mask-image:initial;mask-image:initial}#MoreFreeBBG>*{all:revert;text-wrap:pretty;content-visibility:auto}#MoreFreeBBG p,#MoreFreeBBG li{font-family:var(--article-headline-font-family-serif);font-size:var(--article-body-size);line-height:var(--article-body-line-height);margin-bottom:1.375rem}@media(min-width:48rem){#MoreFreeBBG p,#MoreFreeBBG li{margin-bottom:1.5rem}}#MoreFreeBBG a{-webkit-text-decoration-skip:ink;text-decoration:underline;text-decoration-color:#767676;text-decoration-skip-ink:auto;text-decoration-thickness:1px;text-underline-offset:.1875rem}div[class^='FeatureContent_content']>#MoreFreeBBG{margin-left:auto;margin-right:auto}@media(min-width:768px){div[class^='FeatureContent_content']>#MoreFreeBBG{max-width:38.625rem}}#MoreFreeBBG a.inline-ref{--tw-border-opacity:1;--tw-bg-opacity:1;--tw-text-opacity:1;background-color:rgba(255,255,255,var(--tw-bg-opacity));border-color:rgba(0,0,0,var(--tw-border-opacity));border-width:1px;color:rgba(0,0,0,var(--tw-text-opacity));font-family:BWHaasGroteskWeb,BWHaasGroteskWeb-fallback,Helvetica,Arial,sans-serif;font-size:.625rem;line-height:1.5;margin:.3125rem;padding:.1875rem .375rem;vertical-align:.25rem;text-decoration:none}#MoreFreeBBG li.footer-ref,#MoreFreeBBG li.footer-ref *{font-size:var(--phx-font-core-size-14)}#MoreFreeBBG li.footer-ref>a{display:inline-block}#MoreFreeBBG pre{font-family:monospace,monospace;white-space:pre-wrap;word-break:break-all;color:var(--phx-color-error-primary-text);background-color:var(--phx-color-error-background);padding:1em;max-height:calc(75vh - 1em);overflow-y:auto}#MoreFreeBBG figure>img,#MoreFreeBBG figure>iframe,#MoreFreeBBG figure>video{border:2px outset #767676;box-sizing:border-box}#MoreFreeBBG figcaption{font-size:var(--phx-font-core-size-14)}[id]{scroll-margin-block-start:200px}#MoreFreeBBG .chart{width:100%;position:relative;padding-block-end:1.75em}#MoreFreeBBG .chart>iframe{position:absolute;inset:0;width:100%;height:100%}#reading{width:100%}",
		}),
	);
	const ref = [];
	const parser = c =>
		c
			.map(c => {
				switch (c.type) {
					case "ad":
					case "inline-newsletter":
						return console.debug(c);
					case "paragraph":
						return Object.assign(document.createElement("p"), {
							innerHTML: parser(c.content),
						}).outerHTML;
					case "entity":
						switch (c.subType) {
							case "story":
								return Object.assign(
									document.createElement("a"),
									{
										href:
											c.data.link.webUrl ??
											`${new URL("https://www.google.com/search?").href}${new URLSearchParams({ q: `site:"${document.location.hostname}" "${c.data.link.title}"` })}`,
										target: "_blank",
										title: c.data.link.title ?? "",
										textContent: parser(c.content),
									},
								).outerHTML;
							case "person":
							case "security":
								return parser(c.content);
						}
						break;
					case "text":
						return c.value;
					case "link":
						return Object.assign(document.createElement("a"), {
							href: c.data.href,
							title: c.data.title ?? "",
							target: "_blank",
							rel: "noopener",
							textContent: parser(c.content),
						}).outerHTML;
					case "footnoteRef":
						ref.push(parser(c.data.footnoteContent));
						return Object.assign(document.createElement("a"), {
							id: `inline-ref-${c.data.identifier}`,
							className: "inline-ref",
							textContent: ref.length,
							href: `#footer-ref-${c.data.identifier}`,
						}).outerHTML;
					case "div":
						return Object.assign(document.createElement("div"), {
							innerHTML: parser(c.content),
						}).outerHTML;
					case "media":
						switch (c.subType) {
							case "audio":
								return console.warn(c);
							case "photo":
								const p = c.data.photo;
								return Object.assign(
									document.createElement("figure"),
									{
										innerHTML: `${
											Object.assign(
												document.createElement("img"),
												{
													decoding: "async",
													fetchpriority: "low",
													loading: "lazy",
													align: p.align,
													alt: p.alt,
													src: p.src,
												},
											).outerHTML
										}${
											Object.assign(
												document.createElement(
													"figcaption",
												),
												{
													innerHTML: [
														p.caption,
														Object.assign(
															document.createElement(
																"cite",
															),
															{
																textContent:
																	p.credit,
															},
														).outerHTML,
													].join("\n"),
												},
											).outerHTML
										}`,
									},
								).outerHTML;
							case "chart":
								const t = c.data.chart;
								return Object.assign(
									document.createElement("figure"),
									{
										className: "chart",
										innerHTML: `${
											Object.assign(
												document.createElement("img"),
												{
													decoding: "async",
													fetchpriority: "low",
													loading: "lazy",
													align: t.align,
													alt: t.alt,
													src: t.fallback,
												},
											).outerHTML
										}${
											Object.assign(
												document.createElement(
													"iframe",
												),
												{
													loading: "lazy",
													align: t.align,
													src: t.src,
												},
											).outerHTML
										}`,
									},
								).outerHTML;
							case "video":
								const v = c.data.video;
								return Object.assign(
									document.createElement("figure"),
									{
										innerHTML: `${
											Object.assign(
												document.createElement("video"),
												{
													align: v.align,
													src: v.src,
													alt: v.alt,
													controls: true,
													loading: "lazy",
													preload: "metadata",
													poster: c.data.attachment
														.thumbnail.url,
												},
											).outerHTML
										}${
											Object.assign(
												document.createElement(
													"figcaption",
												),
												{
													innerHTML: [
														v.caption,
														Object.assign(
															document.createElement(
																"cite",
															),
															{
																textContent:
																	v.credit,
															},
														).outerHTML,
													].join("\n"),
												},
											).outerHTML
										}`,
									},
								).outerHTML;
						}
						break;
					case "list":
						return Object.assign(
							document.createElement(
								{ unordered: "ul", ordered: "ol" }[c.subType],
							),
							{
								innerHTML: parser(c.content),
							},
						).outerHTML;
					case "listItem":
						return Object.assign(document.createElement("li"), {
							innerHTML: parser(c.content),
						}).outerHTML;
					case "heading":
						return Object.assign(
							document.createElement(`h${c.data.level + 1}`),
							{
								innerHTML: parser(c.content),
							},
						).outerHTML;
					case "tabularData":
						return Object.assign(document.createElement("table"), {
							innerHTML: Object.assign(
								document.createElement("tbody"),
								{
									innerHTML: parser(c.content),
								},
							).outerHTML,
						}).outerHTML;
					case "columns":
						return Object.assign(document.createElement("tr"), {
							innerHTML: c.data.definitions
								.map(th => {
									const s = {};
									switch (th.dataType) {
										case "text":
											s.textContent = th.title;
											break;
									}
									return Object.assign(
										document.createElement("th"),
										s,
									).outerHTML;
								})
								.join(""),
						}).outerHTML;
					case "row":
						return Object.assign(document.createElement("tr"), {
							innerHTML: parser(c.content),
						}).outerHTML;
					case "cell":
						return Object.assign(document.createElement("th"), {
							className: c.data.class,
							innerHTML: parser(c.content),
						}).outerHTML;
					case "inline-recirc":
						return console.warn(c);
					case "br":
						return document.createElement("br").outerHTML;
				}
				return Object.assign(document.createElement("pre"), {
					textContent: JSON.stringify(c, null, "\t"),
				}).outerHTML;
			})
			.filter(Boolean)
			.join("");
	const story = JSON.parse(
		document.getElementById("__NEXT_DATA__").textContent,
	).props.pageProps.story;
	document
		.querySelector(".body-content,div[class^='FeatureContent_body']")
		?.replaceWith(
			story.readingUrl
				? Object.assign(document.createElement("audio"), {
						id: "reading",
						src: story.readingUrl,
						controls: true,
						loading: "lazy",
						preload: "metadata",
					})
				: "",
			Object.assign(document.createElement("div"), {
				id: "MoreFreeBBG",
				innerHTML: `${parser(story.body.content)}${
					Object.assign(document.createElement("ol"), {
						innerHTML: ref
							.map(
								(r, i) =>
									Object.assign(
										document.createElement("li"),
										{
											id: `footer-ref-footnote-${i + 1}`,
											className: "footer-ref",
											innerHTML: `${r}${
												Object.assign(
													document.createElement("a"),
													{
														href: `#inline-ref-footnote-${i + 1}`,
														textContent:
															"View in article",
													},
												).outerHTML
											}`,
										},
									).outerHTML,
							)
							.join(""),
					}).outerHTML
				}`,
			}),
		);
})();
