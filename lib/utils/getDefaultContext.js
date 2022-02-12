import path from 'path';

const getDefaultContext = () => {
  // Some date variables
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Name of the directory where bluprint is being run
  const dirname = process.cwd().split(path.sep).slice(-1)[0];

  return {
    year,
    month,
    day,
    dirname,
  };
}

export default getDefaultContext;