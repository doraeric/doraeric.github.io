// https://lewky.cn/posts/hugo-3.html/#%e6%b7%bb%e5%8a%a0%e8%87%aa%e5%ae%9a%e4%b9%89%e7%9a%84customjs
// https://github.com/olivernn/lunr.js/issues/68

function asignQueryHandler() {
  if (lunr.queryHandler) {
    const prev = lunr.queryHandler;
    lunr.queryHandler = (query) => prev(`*${query}*`);
  } else {
    lunr.queryHandler = (query) => `*${query}*`;
  }
}
if (lunr !== undefined) {
  setTimeout(asignQueryHandler, 2000);
} else {
  console.log("lunr undefined");
}
