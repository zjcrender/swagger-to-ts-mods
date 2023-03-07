type Options = {
  output: string;
}

export default async function setup(options: Options) {

  console.log('command setup')
  console.log(options);

}