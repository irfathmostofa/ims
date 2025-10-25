type PaginationProps = {
  page: number,
  totalPages: number,
  onPageChange: (page: number) => void,
};

export function CustomPagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
      <button
        className="px-3 py-1.5 rounded bg-gray-200 disabled:opacity-50 text-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>

      <span className="px-2 text-sm whitespace-nowrap">
        Page {page} of {totalPages}
      </span>

      <button
        className="px-3 py-1.5 rounded bg-gray-200 disabled:opacity-50 text-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
