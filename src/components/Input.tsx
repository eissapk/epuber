import { File } from "../assets/icons";
function Input({
  zip,
  label = "New File",
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
    <div className="flex h-[100vh]">
      <div className="flex items-center justify-center flex-col max-w-fit mx-auto">
        {/* file icon */}
        <File />
        {/* title */}
        <h3 className="text-sm text-white font-semibold mt-2">No files</h3>
        {/* description */}
        <p className="text-zinc-100 mt-1">Get started by importing a new epub.</p>
        {/* cta btn */}
        <label
          htmlFor="input"
          className="max-w-fit pointer-events-auto rounded-md bg-red px-4 py-2 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-[#e30b5de6] mt-6"
        >
          <span className="me-2 text-base">+</span>
          {label}
          <input id="input" className="hidden" type="file" onChange={onChangeHandler} />
        </label>
      </div>
    </div>
  );
}

export default Input;
