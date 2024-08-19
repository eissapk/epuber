import thumbnail from "../assets/book.jpg";
function BookInfo({ coverPath, epub, onBookOpen }: { coverPath: string; epub: any; onBookOpen: () => void }) {
  return (
    <div className="flex justify-center items-center gap-6 h-[100vh]">
      <div className="rounded-md overflow-hidden w-64 h-64">
        <img className="w-full h-full object-cover object-top rounded-md hover:opacity-90 transition-all" src={coverPath || thumbnail} />
      </div>
      <div className="flex flex-col gap-y-4 max-w-64">
        <h1 title="Carolina-O" className="text-white truncate  text-3xl md:text-xl lg:text-2xl 2xl:text-3xl">
          {epub.bookTitle}
        </h1>
        <p className="text-zinc-200 text-sm truncate">
          The version of imported epub is <span className="font-bold">{epub.version}</span>
        </p>
        <button
          type="button"
          className="max-w-fit pointer-events-auto rounded-md bg-red px-4 py-2 text-[0.8125rem] font-semibold leading-5 text-white hover:bg-[#e30b5de6]"
          onClick={onBookOpen}
        >
          Open Book
        </button>
      </div>
    </div>
  );
}

export default BookInfo;
