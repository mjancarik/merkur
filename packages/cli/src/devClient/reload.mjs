export async function reload({ to, command }) {
  if (to === 'browser' && command === 'reload') {
    location.reload();
  }
}
