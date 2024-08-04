import "./App.css";
import JSZip from "jszip";
import { loadEpub, parseChapter, getElement } from "./utils";
import { useEffect, useState } from "react";

function App() {
  const zip = new JSZip();
  const [epub, setEpub] = useState({});
  const [coverPath, setCoverPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isInitial, setIsInitial] = useState(false);
  const [chapterBody, setChapterBody] = useState("");
  const [chapterBodyClasses, setChapterBodyClasses] = useState("");
  const [chapterStyle, setChapterStyle] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [fileObject, setFileObject] = useState({});
  useEffect(() => {
    console.log("App loaded");

    return () => {
      // setEpub({});
      // setCoverPath("");
      // setLoading(false);
      // setError(false);
      // setIsInitial(false);
      // setChapterContent("");
      // setFiles([]);
      // setFileObject({});
    };
  });

  const readFile = async (e: any) => {
    setIsInitial(true);
    setLoading(true);
    setError(false);
    setCoverPath("");
    setEpub({});
    setChapterBody("");
    setChapterBodyClasses("");
    setFiles([]);
    setFileObject({});
    const file = e.target.files[0];
    // console.log(file);
    const isEpub = file.type == "application/epub+zip";
    if (!isEpub) return alert("imported file is not epub!");
    zip
      .loadAsync(file)
      .then(async (res) => {
        // console.log(res);
        setFileObject(res);
        const keys = Object.keys(res.files);
        setFiles(keys);

        // OPF
        const opfPath = keys.find((item) => /\.opf/i.test(item));
        if (!opfPath) return console.error("opf doesn't exist!");

        // NCX
        const ncxPath = keys.reverse().find((item) => /\.ncx/i.test(item)); // todo handle reverse later (to keep it or not)
        if (!ncxPath) return console.error("ncx doesn't exist!");
        // console.log({ ncx, opf });

        const epub = await loadEpub({ res, filesPaths: keys, ncxPath, opfPath });
        setEpub(epub);
        setLoading(false);
        setError(false);
        if (epub?.coverPath) {
          const mime = { jpeg: "image/jpeg", jpg: "image/jpeg", png: "image/png" };

          const ext = epub.coverPath.split(".").slice(-1).join("");
          res.files[epub?.coverPath].async("base64").then((base64) => {
            // @ts-expect-error -- handle it in the future
            setCoverPath(`data:${mime[ext]};base64,${base64}`);
            // console.log(`data:${mime[ext]};base64,${base64}`);
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(true);
        // console.error(err);
        alert("the imported file seems to be corrupted!");
      });
  };

  const loadChapter = async (e: any) => {
    e.preventDefault();
    if (e.target.nodeName == "A") {
      const href = e.target.getAttribute("href");
      const ch = await parseChapter({ href, filesPaths: files, fileObject });
      console.log(ch.id);
      setTimeout(() => {
        document.getElementById(ch.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

      const chapterContent = await getElement(ch.chapterContent, "html");

      // styles
      const head = chapterContent.querySelector("head");
      const links = head.querySelectorAll("link");
      const styleFilesArr: string[] = [];
      const stylesContentArr: string[] = [];

      const handleImages = () => {
        console.log("handling images"); // todo handle images
      };
      const doneStyling = () => {
        console.log("done styling");
        setChapterStyle(stylesContentArr);
        console.log(styleFilesArr);
        console.log(stylesContentArr);
        handleImages();
      };
      links.forEach((link: any) => {
        if (link.getAttribute("rel") == "stylesheet") styleFilesArr.push(link.getAttribute("href"));
      });

      styleFilesArr.forEach(async (styleFile, i: number) => {
        const styleFilePath = files.find((file) => new RegExp(`${styleFile}`, "i").test(file));
        if (styleFilePath) {
          const css = await fileObject.files[styleFilePath].async("string");
          stylesContentArr.push(css);
          if (i == styleFilesArr.length - 1) doneStyling();
        }
      });

      const body = chapterContent.querySelector("body");
      const bodyClasses = body?.getAttribute("class");
      setChapterBodyClasses(bodyClasses);
      setChapterBody(body?.innerHTML);
      console.log(ch);
      console.log(head, body);
    }
  };

  return (
    <main>
      {/* input */}
      <div className="outline outline-red-300">
        <input type="file" onChange={readFile} />
      </div>
      {/* toc */}
      <div className="outline outline-blue-300">
        {isInitial && !loading && !error && (
          <>
            <article>
              <img src={coverPath || "https://placehold.co/400x600"} alt="Book Cover" />
              <div>
                <h1 className="text-5xl font-bold">{epub.bookTitle}</h1>
                <p>
                  Epub version: <i>{epub.version}</i>
                </p>
              </div>
            </article>

            <nav className="outline outline-yellow-300 mt-4" dangerouslySetInnerHTML={{ __html: epub.toc }} onClick={loadChapter}></nav>
          </>
        )}
      </div>

      {/* book view */}
      <div className="outline outline-green-300 ">
        {chapterStyle.map((style: string, i: number) => (
          <style key={i} dangerouslySetInnerHTML={{ __html: style }}></style>
        ))}
        <div className={`${chapterBodyClasses} prose`} dangerouslySetInnerHTML={{ __html: chapterBody }}></div>
      </div>
    </main>
  );
}

export default App;
