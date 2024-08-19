import "./TableOfContents.css";
import { getElement, imgToBase64, parseChapter } from "../utils";

function TableOfContents({
  setIsLoadingChapter,
  epub,
  onChapterLoaded,
  isOpened,
}: {
  epub: any;
  isOpened: boolean;
  onChapterLoaded: (chapterBody: Element, chapterBodyClasses: string, id: string, stylesContentArr: string[]) => void;
  setIsLoadingChapter: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleHtml = async (href: string) => {
    const ch = await parseChapter({ href, filesPaths: epub.filesPaths, fileObject: epub.res });
    // console.log(ch);
    const dom = await getElement(ch.chapterContent, "html");

    // @ts-expect-error -- handler it later
    const body = dom.querySelector("body");
    // @ts-expect-error -- handler it later
    const head = dom.querySelector("head");
    const bodyClasses = body?.className || "";
    // console.log(body);
    return { body, bodyClasses, head, id: ch.id };
  };

  const handleImg = async (body: Element, cb?: () => void) => {
    const imgs = body?.querySelectorAll("img");
    const recursive = async (n = 0) => {
      const img = imgs[n];
      // console.log(img, img.src);

      // if (!img || !img.getAttribute("src")) return recursive(n + 1);
      // @ts-expect-error -- handle it later
      const imgName = img.getAttribute("src").replace(/\.\.\//g, ""); // remove ../../
      const imgPath = epub.filesPaths.find((file: string) => new RegExp(`${imgName}`, "i").test(file));
      const base64 = await imgToBase64(epub.res, imgPath);

      img.src = base64;
      if (n < imgs.length - 1) recursive(n + 1);
      if (n == imgs.length - 1) cb && cb();
    };
    if (imgs.length) recursive();
    else cb && cb();
  };

  const handleStyles = async (head: Element, cb: (arr: string[]) => void) => {
    const links = head.querySelectorAll("link");
    const styleFilesArr: string[] = [];
    const stylesContentArr: string[] = [];

    links.forEach((link: any) => {
      if (link.getAttribute("rel") == "stylesheet") styleFilesArr.push(link.getAttribute("href"));
    });

    // console.log("styleFilesArr.length:", styleFilesArr.length);

    styleFilesArr.forEach(async (styleFile: string) => {
      styleFile = styleFile.replace(/\.\.\//g, ""); // remove ../../
      const styleFilePath = epub.filesPaths.find((file: string) => new RegExp(`${styleFile}`, "i").test(file));
      if (styleFilePath) {
        const css = await epub.res.files[styleFilePath].async("string");
        stylesContentArr.push(css);
      }
      if (styleFilesArr.length == stylesContentArr.length) {
        // console.log("done styles", stylesContentArr);
        cb(stylesContentArr);
      }
    });
  };

  const onClickHandler = async (e: any) => {
    e.preventDefault();
    if (e.target.nodeName == "A") {
      setIsLoadingChapter(true);
      const href = e.target.getAttribute("href").replace(/\.\.\//g, ""); // remove ../
      // console.log("href:", href);

      // html
      const { body, bodyClasses, head, id } = await handleHtml(href);
      // styles
      await handleStyles(head, async (stylesArr: string[]) => {
        // images
        await handleImg(body, () => {
          onChapterLoaded(body, bodyClasses, id, stylesArr);
        });
      });
    }
    if (e.target.classList.contains("caret")) {
      const ul = e.target?.parentElement?.parentElement;
      if (ul && ul.classList.contains("parent")) {
        if (ul.classList.contains("expand")) {
          ul.classList.remove("expand");
          e.target.classList.remove("reverse");
        } else {
          ul.classList.add("expand");
          e.target.classList.add("reverse");
        }
      }
    }
  };

  return (
    <div className={`toc scroll xrelative ${isOpened ? "opened" : "closed"}`}>
      <div className="fixed flex justify-between items-center bg-black py-4 w-[14rem] z-10">
        <h1 className="font-bold text ps-4">Table of contents</h1>
      </div>
      <nav className="px-2 pb-4" dangerouslySetInnerHTML={{ __html: epub.toc }} onClick={onClickHandler}></nav>
    </div>
  );
}

export default TableOfContents;
