export function printView(divID: string) {
  const printSection = document.querySelector(".print_section") as HTMLElement;
  const targetDiv = document.getElementById(divID);

  if (printSection && targetDiv) {
    printSection.innerHTML = targetDiv.innerHTML;
    window.print();
  }
}
