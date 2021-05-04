import * as recurly  from "recurly";

class Recurlyclient {
  constructor() {
  }
  public init() {
    return new recurly.Client(process.env.RECURLY_API_KEY!);
  }
}

export = Recurlyclient;