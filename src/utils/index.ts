const loadEpub = async (res: any, containerPath: any) => {
  try {
    const fileContent = (await getFileContent(
      res.files[containerPath]
    )) as string;
    console.log(res);
    console.log(containerPath);
    // console.log(fileContent);

    const rootfile = await getElement(fileContent, "rootfile");
    // console.log(rootfile);

    // @ts-expect-error -- handle it later
    const fullPath = rootfile.getAttribute("full-path");
    if (!fullPath) return console.error("full-path of rootfile doesn't exist!");
    console.log("content.opf path:", fullPath);

    const contentOpf = await getFileContent(res.files[fullPath]);
    // console.log(contentOpf);
    // @ts-expect-error -- handle it later
    const epubVersion = await getEpubVersion(contentOpf);
    console.log("epub version:", epubVersion);

    // @ts-expect-error -- handle it later
    const item = await getElement(contentOpf, "#ncx");
    // console.log(item);

    // @ts-expect-error -- handle it later
    const ncx = item.getAttribute("href");
    if (!ncx) return console.error("href of ncx doesn't exist!");

    let ncxPath = getNcxPath(ncx, fullPath);

    // fallback to get absolute path of ncx file -- for other epub providers | it may have errors in the future
    const keys = Object.keys(res.files);
    if (!keys.includes(ncxPath)) {
      ncxPath = fullPath.split("/")[0] + "/" + ncxPath;
    }

    console.log("ncx path:", ncxPath);

    const ncxContent = (await getFileContent(res.files[ncxPath])) as string;

    const bookTitle = await getBookTitle(ncxContent);
    console.log({ bookTitle });
    console.log(ncxContent);

    let nav = null;
    try {
      nav = await getElement(ncxContent, "nav");
    } catch (err) {
      const navMap = (await getElement(ncxContent, "navMap")) as Element;
      console.log(navMap);

      nav = convertToNav(navMap);
    }

    console.log(nav);

    // const toc = await getElm(content2, 'item[properties="nav"]');
    // let tocPath = toc.getAttribute("href");
    // if (!tocPath) return;

    // const arr2 = tocPath.split("/");
    // arr2.pop(); // remove file name and keep the reset of path
    // tocPath = arr.join("/") + "/" + tocPath;
    // tocPath = tocPath.replace(/\/\//g, "/");
    // console.warn("toc file:", tocPath);

    // const toc_ = await readFile(res.files[tocPath]);
    // const nav = await getElm(toc_, "nav#toc");

    // console.warn(nav);
    // handleTocLinks(nav, tocPath);
    // tableOfContent.innerHTML = nav.outerHTML;
    // loadChapters(tableOfContent);
  } catch (error) {
    console.error(error);
  }
};

function getFileContent(file: any) {
  return new Promise((resolve) => file.async("string").then(resolve));
}

function getElement(text: string, selector: string) {
  const parser = new DOMParser();
  return new Promise((resolve, reject) => {
    const dom = parser.parseFromString(text, "text/xml");
    if (!dom) return reject("dom not found");
    const elm = dom.querySelector(selector);
    if (!elm) return reject("element not found");
    resolve(elm);
  });
}

const getNcxPath = (ncx: string, fullPath: string) => {
  // console.log("ncx:", ncx);
  // console.log("fullPath:", fullPath);
  let ncxPath = "";

  // outside the directory of content.opf
  if (/\//.test(ncx)) {
    // @ts-check -- handle the path of ncx if outside the directory of content.opf | I assume it is absolute path here
    ncxPath = ncx;
  } else {
    // inside the directory of content.opf
    ncxPath = fullPath.split("/").slice(0, -1).join("/") + "/" + ncx;
  }
  // console.log("ncxPath:", ncxPath);
  return ncxPath;
};

const getEpubVersion = async (text: string) => {
  const packageElm = (await getElement(text, "package")) as Element;
  if (!packageElm) return "2";
  const version = packageElm.getAttribute("version");
  if (!version) return "2";
  return version.split(".")[0];
};

// todo handle title of other epub providers
const getBookTitle = async (text: string) => {
  let title = null;
  try {
    title = (await getElement(text, "title")) as Element;
  } catch (error) {
    title = (await getElement(text, "docTitle")) as Element;
  }
  return title.textContent?.trim().replace(/\\n/g, "");
};

const convertToNav = (navMap: Element) => {
  const nav = document.createElement("nav");

  const navPoints = navMap.querySelectorAll("navPoint");
  navPoints.forEach((navPoint) => {
    // console.log(navPoint);
    const navLabel = navPoint.querySelector("navLabel");
    const navContent = navPoint.querySelector("content");
    if (navLabel && navContent) {
      const a = document.createElement("a");
      // @ts-expect-error -- handle it in the future
      a.href = navContent.getAttribute("src");
      a.textContent = navLabel.textContent;
      navPoint.prepend(a);
      navLabel.remove();
      navContent.remove();
    }
  });

  // todo fix this part -- it should be clean html 5
  const olAsString = navMap.outerHTML.toString();
  olAsString.replace(/xmlns="[^"]*"/gi, "");
  olAsString.replace(/navPoint/gi, "li");
  console.log(olAsString);

  //   nav.insertAdjacentHTML("afterbegin", olAsString);
  //   console.log(nav.outerHTML);

  //   return nav;
  return "";
};

export { loadEpub };
