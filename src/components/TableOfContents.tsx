import "./TableOfContents.css";
import { getElement, imgToBase64, parseChapter } from "../utils";
import { useState } from "react";

function TableOfContents({
  coverPath,
  epub,
  onChapterLoaded,
}: {
  coverPath: string;
  epub: any;
  onChapterLoaded: (body: Element, id: string, stylesContentArr: string[]) => void;
}) {
  const [isOpened, setIsOpened] = useState(true);
  // todo: split this function into pieces of Promises
  const onClickHandler = async (e: any) => {
    e.preventDefault();
    if (e.target.nodeName == "A") {
      const href = e.target.getAttribute("href").replace(/\.\.\//, ""); // remove ../
      const ch = await parseChapter({ href, filesPaths: epub.filesPaths, fileObject: epub.res });
      // console.log(ch);

      const chapterContent = await getElement(ch.chapterContent, "html");

      // markup
      const body = chapterContent.querySelector("body");
      console.log(body);

      // images
      const imgs = body.querySelectorAll("img");
      imgs.forEach(async (img: any, i: number) => {
        const imgName = img.getAttribute("src");
        const imgPath = epub.filesPaths.find((file: any) => new RegExp(`${imgName}`, "i").test(file));
        const base64 = await imgToBase64(epub.res, imgPath);
        // console.log(base64);
        // console.log(img);

        img.src = base64;
        if (i == imgs.length - 1) done();
      });

      // styles
      const head = chapterContent.querySelector("head");
      const links = head.querySelectorAll("link");
      const styleFilesArr: string[] = [];
      const stylesContentArr: string[] = [];

      links.forEach((link: any) => {
        if (link.getAttribute("rel") == "stylesheet") styleFilesArr.push(link.getAttribute("href"));
      });

      styleFilesArr.forEach(async (styleFile: string, i: number) => {
        const styleFilePath = epub.filesPaths.find((file: string) => new RegExp(`${styleFile}`, "i").test(file));
        if (styleFilePath) {
          const css = await epub.res.files[styleFilePath].async("string");
          stylesContentArr.push(css);
        }
        if (i == styleFilesArr.length - 1 && !imgs.length) done();
      });

      if (!imgs?.length && !styleFilesArr.length) {
        done();
      }
      function done() {
        onChapterLoaded(body, ch.id, stylesContentArr);
      }
    }
  };

  const toggleTOC = () => {
    setIsOpened(!isOpened);
  };

  return (
    <div className={`toc ${isOpened ? "opened" : "closed"}`}>
      <button className="toggleBtn" type="button" onClick={toggleTOC}>
        {isOpened ? "<" : ">"}
      </button>
      <article>
        <img src={coverPath || "https://placehold.co/250x325"} alt="Book Cover" />
        <h1>{epub.bookTitle}</h1>
        <span>
          Epub ver<i>({epub.version})</i>
        </span>
      </article>

      <nav dangerouslySetInnerHTML={{ __html: epub.toc }} onClick={onClickHandler}></nav>
    </div>
  );
}

export default TableOfContents;
