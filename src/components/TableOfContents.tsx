import { getElement, imgToBase64, parseChapter } from "../utils";

function TableOfContents({
  coverPath,
  epub,
  onChapterLoaded,
}: {
  coverPath: string;
  epub: any;
  onChapterLoaded: (body: Element, id: string, stylesContentArr: string[]) => void;
}) {
  const imageStyle = {
    width: "250px",
    height: "325px",
    objectFit: "cover",
    objectPosition: "top",
  };
  const onClickHandler = async (e: any) => {
    e.preventDefault();
    if (e.target.nodeName == "A") {
      const href = e.target.getAttribute("href").replace(/\.\.\//, ""); // remove ../
      const ch = await parseChapter({ href, filesPaths: epub.filesPaths, fileObject: epub.res });
      //   console.log(ch);

      const chapterContent = await getElement(ch.chapterContent, "html");

      // markup
      const body = chapterContent.querySelector("body");

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

      styleFilesArr.forEach(async (styleFile) => {
        const styleFilePath = epub.filesPaths.find((file) => new RegExp(`${styleFile}`, "i").test(file));
        if (styleFilePath) {
          const css = await epub.res.files[styleFilePath].async("string");
          stylesContentArr.push(css);
        }
      });
      function done() {
        onChapterLoaded(body, ch.id, stylesContentArr);
      }
    }
  };

  return (
    <div>
      <article>
        <img style={imageStyle} src={coverPath || "https://placehold.co/250x325"} alt="Book Cover" />
        <h1>{epub.bookTitle}</h1>
        <p>
          Epub version: <i>{epub.version}</i>
        </p>
      </article>
      <hr />

      <nav dangerouslySetInnerHTML={{ __html: epub.toc }} onClick={onClickHandler}></nav>
    </div>
  );
}

export default TableOfContents;
