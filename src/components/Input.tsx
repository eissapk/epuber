import "./Input.css";
function Input({
  zip,
  label = "Import Epub",
  onReadFile,
  onSelect,
}: {
  zip: any;
  label: string;
  onReadFile: ({ res, keys, opfPath, ncxPath }: { res: any; keys: string[]; opfPath: string; ncxPath: string }) => void;
  onSelect: (arg: boolean) => void;
}) {
  const onChangeHandler = async (e: any) => {
    const file = e.target.files[0];
    const isEpub = file.type == "application/epub+zip";
    if (!isEpub) return alert("imported file is not epub!");

    try {
      // todo check limitations: https://stuk.github.io/jszip/documentation/limitations.html
      const res = await zip.loadAsync(file);
      const keys = Object.keys(res.files);

      // OPF
      const opfPath = keys.find((item) => /\.opf/i.test(item));
      if (!opfPath) return console.error("opf doesn't exist!");

      // NCX
      const ncxPath = keys.reverse().find((item) => /\.ncx/i.test(item)); // todo handle reverse later (to keep it or not)
      if (!ncxPath) return console.error("ncx doesn't exist!");

      //   console.log({ res, keys, ncxPath, opfPath });
      onReadFile({ res, keys, opfPath, ncxPath });
      onSelect(true);
    } catch (err) {
      alert("the imported file seems to be corrupted!");
    }
  };

  return (
    <div className="importFile">
      <label>{label}</label>
      <input type="file" onChange={onChangeHandler} />
    </div>
  );
}

export default Input;
