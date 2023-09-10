const input = document.querySelector("input");
const chapterWrapper = document.querySelector("#content");
const tableOfContent = document.querySelector("#toc");
const parser = new DOMParser();
var new_zip = new JSZip();
var response = null;

function readFile(filePath) {
  return new Promise((resolve) => {
    filePath.async("string").then((content) => {
      resolve(content);
    });
  });
}

function getElm(content, selector) {
  return new Promise((resolve, reject) => {
    const dom = parser.parseFromString(content, "text/xml");
    if (!dom) return reject();
    const elm = dom.querySelector(selector);
    if (!elm) return reject();
    resolve(elm);
  });
}

input.onchange = function (e) {
  // reset
  response = null;
  chapterWrapper.innerHTML = "";
  tableOfContent.innerHTML = "";

  const file = e.target.files[0];
  const fileType = file.type;
  if (fileType !== "application/epub+zip")
    return alert("imported file is not epub!");

  new_zip
    .loadAsync(file)
    .then((res) => {
      console.warn("res", res);
      response = res;
      const keys = Object.keys(res.files);
      const containerPath = keys.find((item) => item.includes("container.xml"));
      if (!containerPath) return console.error("container.xml doesn't exist!");
      console.warn("container.xml file:", containerPath);
      load(res, containerPath);
    })
    .catch(console.error);
};

async function load(res, containerPath) {
  const content = await readFile(res.files[containerPath]);
  const elm = await getElm(content, "rootfile");

  const opfPath = elm.getAttribute("full-path");
  if (!opfPath) return;
  console.warn("opf file:", opfPath);

  const content2 = await readFile(res.files[opfPath]);
  const elm2 = await getElm(content2, "#ncx");
  let ncxPath = elm2.getAttribute("href");
  if (!ncxPath) return;
  const arr = opfPath.split("/");
  arr.pop(); // remove file name and keep the reset of path
  ncxPath = arr.join("/") + "/" + ncxPath;
  ncxPath = ncxPath.replace(/\/\//g, "/");
  console.warn("ncx file:", ncxPath);

  const toc = await getElm(content2, 'item[properties="nav"]');
  let tocPath = toc.getAttribute("href");
  if (!tocPath) return;

  const arr2 = tocPath.split("/");
  arr2.pop(); // remove file name and keep the reset of path
  tocPath = arr.join("/") + "/" + tocPath;
  tocPath = tocPath.replace(/\/\//g, "/");
  console.warn("toc file:", tocPath);

  const toc_ = await readFile(res.files[tocPath]);
  const nav = await getElm(toc_, "nav#toc");

  console.warn(nav);
  handleTocLinks(nav, tocPath);
  tableOfContent.innerHTML = nav.outerHTML;
  loadChapters(tableOfContent);
}

function handleTocLinks(nav, baseURL) {
  const arr = baseURL.split("/");
  arr.pop(); // remove file name and keep the reset of path
  baseURL = arr.join("/");
  baseURL = baseURL.replace(/\/\//g, "/");
  console.warn("baseURL:", baseURL);
  const links = nav.querySelectorAll("a");
  links.forEach((link) => {
    if (link.getAttribute("href")) {
      const finalPath = baseURL + "/" + link.getAttribute("href");
      link.setAttribute("href", "javascript:void(0)");
      link.setAttribute("data-path", finalPath);
    }
  });
}

function loadChapters(wrapper) {
  console.warn("loaded chapters");
  wrapper.onclick = async function (e) {
    if (e.target.nodeName === "A") {
      // console.warn(e.target);
      const chapterPath = e.target.getAttribute("data-path");
      const chapterTitle = e.target.textContent;
      console.warn({ chapterPath, chapterTitle });
      if (!response) return;
      const content = await readFile(response.files[chapterPath]);
      if (!chapterWrapper) return;
      chapterWrapper.innerHTML = "<iframe srcdoc='" + content + "'></iframe>";
      // todo: handle reading other files within the chapter e.g .js, .css, .png, etc
    }
  };
}
