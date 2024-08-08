const loadEpub = async ({ res, filesPaths, ncxPath, opfPath }: { res: any; filesPaths: string[]; ncxPath: string; opfPath: string }) => {
  try {
    // OPF
    const opfContent = (await getFileContent(res.files[opfPath])) as string;
    // console.log("opf content:\n", opfContent);
    const packageElement = (await getElement(opfContent, "package")) as Element;
    const version = packageElement.getAttribute("version");
    const coverPath = getBookCover(res, packageElement, filesPaths);

    // NCX
    const ncxContent = (await getFileContent(res.files[ncxPath])) as string;
    const bookTitle = await getBookTitle(ncxContent);
    // console.log("ncx content:\n", ncxContent);

    // TOC
    let nav = null;
    try {
      nav = await getElement(ncxContent, "nav");
    } catch (err) {
      const navMap = (await getElement(ncxContent, "navMap")) as Element;
      // console.log(navMap);
      nav = convertToNav(navMap);
    }
    console.log(nav);

    // @ts-expect-error -- handler it later
    const data = { version, coverPath, bookTitle, ncxPath, opfPath, filesPaths, res, toc: nav.innerHTML };
    // console.log({ncxContent, opfContent});
    // console.log(data);

    return data;
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
      const li = document.createElement("li");
      // @ts-expect-error -- handle it in the future
      a.href = navContent.getAttribute("src");
      a.textContent = navLabel.textContent;
      li.append(a);
      navPoint.prepend(li);
      navLabel.remove();
      navContent.remove();
    }
  });

  // todo fix this part -- it should be clean html 5 | li is the issue it should be inside a tag
  let markup = navMap.innerHTML;
  markup = markup.replace(/playOrder="[^"]*"/gi, "").replace(/xmlns="[^"]*"/gi, "");
  markup = markup.replace(/navPoint/gi, "ul");
  // console.log(markup);

  nav.innerHTML = markup;

  return nav;
};
// @ts-expect-error -- handler it later
const getBookCover = (res: any, pkg: Element, keys: string[]) => {
  let coverPath = null;
  try {
    const cover = pkg.querySelector("meta[name='cover']");
    if (!cover) console.log("cover doesn't exist!");

    const coverId = cover!.getAttribute("content");
    if (!coverId) console.log("coverId doesn't exist!");

    const imgItem = pkg.querySelector("#" + coverId);
    if (!imgItem) console.log("imgItem doesn't exist!");

    coverPath = imgItem!.getAttribute("href");
  } catch (err) {}
  return keys.find((key) => new RegExp(`${coverPath}`, "i").test(key));
};

const imgToBase64 = async (res: any, coverPath: string) => {
  const mime = { jpeg: "image/jpeg", jpg: "image/jpeg", png: "image/png" };
  const ext = coverPath?.split(".").slice(-1).join("");
  console.log({ ext, coverPath });

  const base64 = await res.files[coverPath].async("base64");
  // @ts-expect-error -- handle it in the future
  return `data:${mime[ext]};base64,${base64}`;
};

const parseChapter = async ({ href, filesPaths, fileObject }: { href: string; filesPaths: string[]; fileObject: any }) => {
  const hrefArr = href.split("#");
  const cleanHref = hrefArr[0];
  const chapterPath = filesPaths.find((file) => new RegExp(`${cleanHref}`, "i").test(file));
  console.log({ href, cleanHref, chapterPath });
  // @ts-expect-error -- handler it later
  const chapterContent = await fileObject.files[chapterPath].async("string");
  return { chapterContent, id: hrefArr[1] };
};
export { loadEpub, parseChapter, getElement, imgToBase64 };
