import "./App.css";
import JSZip from "jszip";
import { loadEpub, imgToBase64 } from "./utils";
import { useState } from "react";
import Input from "./components/Input";
import TableOfContents from "./components/TableOfContents";
import Chapter from "./components/Chapter";

function App() {
  const zip = new JSZip();
  const [epub, setEpub] = useState({});
  const [coverPath, setCoverPath] = useState("");
  const [chId, setChId] = useState("");
  const [chapterBody, setChapterBody] = useState<any>("");
  const [stylesContentArr, setStylesContentArr] = useState<string[]>([]);

  const readFile = async ({ res, keys, opfPath, ncxPath }: { res: any; keys: string[]; opfPath: string; ncxPath: string }) => {
    // console.log({ res, keys, ncxPath, opfPath });

    const epub = await loadEpub({ res, filesPaths: keys, ncxPath, opfPath });
    console.log(epub);
    setEpub(epub);

    if (epub?.coverPath) {
      const base64 = await imgToBase64(res, epub.coverPath);
      setCoverPath(base64);
    }
  };

  function chapterLoaded(chapterBody: Element, id: string, stylesContentArr: string[]) {
    setChId(id);
    setChapterBody(chapterBody);
    setStylesContentArr(stylesContentArr);
    // console.log(id, chapterBody, stylesContentArr);
  }

  return (
    <main>
      <Input zip={zip} onReadFile={readFile} label="Import Epub File" />
      <hr />
      <TableOfContents coverPath={coverPath} epub={epub} onChapterLoaded={chapterLoaded} />
      <hr />
      <Chapter chapterBody={chapterBody} chId={chId} stylesContentArr={stylesContentArr} />
    </main>
  );
}

export default App;
