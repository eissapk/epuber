import "./App.css";
import JSZip from "jszip";
import { loadEpub, imgToBase64 } from "./utils";
import { useState } from "react";
import Input from "./components/Input";
import TableOfContents from "./components/TableOfContents";
import Chapter from "./components/Chapter";
import BookInfo from "./components/BookInfo";

function App() {
  const zip = new JSZip();
  const [epub, setEpub] = useState({});
  const [coverPath, setCoverPath] = useState("");
  const [chId, setChId] = useState("");
  const [chapterBody, setChapterBody] = useState<any>("");
  const [chapterBodyClasses, setChapterBodyClasses] = useState<any>("");
  const [stylesContentArr, setStylesContentArr] = useState<string[]>([]);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

  const readFile = async ({ res, keys, opfPath, ncxPath }: { res: any; keys: string[]; opfPath: string; ncxPath: string }) => {
    // console.log({ res, keys, ncxPath, opfPath });

    const epub = await loadEpub({ res, filesPaths: keys, ncxPath, opfPath });
    console.log(epub);
    // @ts-expect-error -- handle it later
    setEpub(epub);

    if (epub?.coverPath) {
      const base64 = await imgToBase64(res, epub.coverPath);
      setCoverPath(base64);
    }
  };

  function chapterLoaded(chapterBody: Element, chapterBodyClasses: string, id: string, stylesContentArr: string[]) {
    setChId(id);
    setChapterBody(chapterBody);
    setChapterBodyClasses(chapterBodyClasses);
    setStylesContentArr(stylesContentArr);
    setIsLoadingChapter(false);
    // console.log(id, chapterBody, stylesContentArr);
  }

  function openBook() {
    console.log("open book");
    setIsFileLoaded(true);
  }

  return (
    <main>
      {!isFileSelected && <Input zip={zip} onReadFile={readFile} label="Import Epub File" onSelect={setIsFileSelected} />}
      {isFileSelected && !isFileLoaded && <BookInfo epub={epub} coverPath={coverPath} onBookOpen={openBook} />}
      {isFileLoaded && <TableOfContents epub={epub} onChapterLoaded={chapterLoaded} setIsLoadingChapter={setIsLoadingChapter} />}
      {isLoadingChapter && <div className="text-center">Loading Chapter...</div>}
      <Chapter chapterBody={chapterBody} chId={chId} stylesContentArr={stylesContentArr} chapterBodyClasses={chapterBodyClasses} />
    </main>
  );
}

export default App;
