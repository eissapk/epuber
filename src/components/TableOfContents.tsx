import "./TableOfContents.css";
import { getElement, imgToBase64, parseChapter } from "../utils";
import { useState } from "react";
import { Toggle } from "../assets/icons";

function TableOfContents({
  setIsLoadingChapter,
  epub,
  onChapterLoaded,
}: {
  epub: any;
  onChapterLoaded: (chapterBody: Element, chapterBodyClasses: string, id: string, stylesContentArr: string[]) => void;
  setIsLoadingChapter: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isOpened, setIsOpened] = useState(true);

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

    console.log("styleFilesArr.length:", styleFilesArr.length);

    styleFilesArr.forEach(async (styleFile: string) => {
      styleFile = styleFile.replace(/\.\.\//g, ""); // remove ../../
      const styleFilePath = epub.filesPaths.find((file: string) => new RegExp(`${styleFile}`, "i").test(file));
      if (styleFilePath) {
        const css = await epub.res.files[styleFilePath].async("string");
        stylesContentArr.push(css);
      }
      if (styleFilesArr.length == stylesContentArr.length) {
        console.log("done styles", stylesContentArr);
        cb(stylesContentArr);
      }
    });
  };

  const onClickHandler = async (e: any) => {
    e.preventDefault();
    if (e.target.nodeName == "A") {
      setIsLoadingChapter(true);
      const href = e.target.getAttribute("href").replace(/\.\.\//g, ""); // remove ../
      console.log("href:", href);

      // html
      const { body, bodyClasses, head, id } = await handleHtml(href);
      // styles
      await handleStyles(head, async (stylesArr: string[]) => {
        // images
        await handleImg(body, () => {
          onChapterLoaded(body, bodyClasses, id, stylesArr);
          setIsOpened(false);
        });
      });
    }
  };

  const toggleTOC = () => {
    setIsOpened(!isOpened);
  };

  return (
    <div className={`toc ${isOpened ? "opened" : "closed"}`}>
      <button className="absolute p-3 right-2 top-2" type="button" onClick={toggleTOC}>
        {isOpened ? <Toggle className="rotate-180" /> : <Toggle />}
      </button>
      <nav dangerouslySetInnerHTML={{ __html: epub.toc }} onClick={onClickHandler}></nav>
    </div>
  );
}

export default TableOfContents;
