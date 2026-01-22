import logWorkerCode from "./log.worker";

const code = logWorkerCode.toString();
const blob = new Blob([`(${code})()`]);
const worker = new Worker(URL.createObjectURL(blob));

export default worker;