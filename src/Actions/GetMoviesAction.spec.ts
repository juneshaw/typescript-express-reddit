/* eslint-disable no-unused-expressions */
import { GetMoviesAction } from "./GetMoviesAction";

describe("GetMoviesAction", () => {
  it("Execute_Year_Success", async () => {
    const objUnderTest = new GetMoviesAction(
    );
    const params = {
      year: "2020"
    }
    const result = await objUnderTest.Execute(params);
    expect(result).toEqual(testResult);
  });

  it("Execute_Year_Fail", async () => {
    const objUnderTest = new GetMoviesAction(
    );
    const params = {
      year: "invalid"
    }
    const result = await objUnderTest.Execute(params);
    expect(result).toEqual(testResultFailYear);
  });

  it("Execute_Page_Fail", async () => {
    const objUnderTest = new GetMoviesAction(
    );
    const params = {
      page: "invalid"
    }
    const result = await objUnderTest.Execute(params);
    expect(result).toEqual(testResultFailPage);
  });

  it("Execute_Year_Page_Fail", async () => {
    const objUnderTest = new GetMoviesAction(
    );
    const params = {
      year: "invalid",
      page: "invalid"
    }
    const result = await objUnderTest.Execute(params);
    expect(result).toEqual(testResultFailYearPage);
  });
});

const testResult = {
  status: {
    code: 200
  },
  data:
    [
      {
        imdbId: 'tt1630029',
        title: 'Avatar 2',
        genres: [
          {
            "id": 28,
            "name": "Action",
          },
          {
            "id": 12,
            "name": "Adventure",
          },
          {
            "id": 14,
            "name": "Fantasy",
          },
          {
            "id": 878,
            "name": "Science Fiction",
          }
        ],
        releaseDate: '2020-12-16',
        budget: '$0'
      }
    ]
};

const testResultFailYear = {
  status: {
    "code": 422,
    "message": "invalid year"
  }
}

const testResultFailPage = {
  status: {
    "code": 422,
    "message": "invalid page"
  }
}

const testResultFailYearPage = {
  status: {
    "code": 422,
    "message": "invalid year, invalid page"
  }
}