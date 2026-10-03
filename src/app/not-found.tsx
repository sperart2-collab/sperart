import Shell from "@/components/Shell";
export default function NotFound() {
  return (<Shell><h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Looks like we missed a beat.</h1><p className="mt-4 text-lg text-ink/70">That page does not exist.</p><a href="/" className="btn btn-blue mt-8">Back to home</a></Shell>);
}
