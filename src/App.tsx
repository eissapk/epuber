import "./App.css";
import JSZip from "jszip";
import { loadEpub } from "./utils";

function App() {
  const zip = new JSZip();

  const readFile = (e: any) => {
    const file = e.target.files[0];
    // console.log(file);
    const isEpub = file.type == "application/epub+zip";
    if (!isEpub) return alert("imported file is not epub!");
    zip.loadAsync(file).then((res) => {
      // console.log(res);
      const keys = Object.keys(res.files);
      const containerPath = keys.find((item) => item.includes("container.xml"));
      if (!containerPath) return console.error("container.xml doesn't exist!");
      loadEpub(res, containerPath);
    });
  };

  return (
    <div>
      <input type="file" onChange={readFile} />
    </div>
  );
}

export default App;
