import { BuyCoffee, Toggle } from "../assets/icons";

function Header({
  isOpened,
  setIsOpened,
  isFileLoaded,
}: {
  isFileLoaded: boolean;
  isOpened: boolean;
  setIsOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="flex justify-between fixed border-b w-full p-4 text-sm border-sub bg-black z-10">
      <div className="flex items-center">
        {isFileLoaded && (
          <button className="text-white" type="button" onClick={() => setIsOpened(!isOpened)}>
            <Toggle className="h-6" />
          </button>
        )}
      </div>
      <div className="flex gap-4 justify-end">
        <a href="https://www.paypal.me/eissapk" target="_blank" className="gap-2 flex text-white  justify-center items-center">
          <BuyCoffee className="h-6 w-auto" />
          Buy me a coffee
        </a>
        {/* <a href="https://github.com/eissapk/epuber" target="_blank" className=" gap-2 flex text-white  justify-center items-center">
          <Github className="h-6 w-6" />
          Contribute
        </a> */}
      </div>
    </header>
  );
}

export default Header;
