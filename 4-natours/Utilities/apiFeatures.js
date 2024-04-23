class APIFeatures
{
  constructor(query, queryString)
  {
    this.query = query;
    this.queryString = queryString;
  }

  Filter()
  {
    const queryObject = {...this.queryString}; //Creates a copy and does not affect the original request.query
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach(element => delete queryObject[element]);

    const queryString = JSON.stringify(queryObject)
                            .replace(/\b(gte|te|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryString));
    return this;
  }

  Sort()
  {
    if(this.queryString.sort)
    {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    else
    {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  LimitFields()
  {
    if(this.queryString.fields)
    {
      const fields = this.queryString.fields.split(",").join("");
      this.query = this.query.select(fields);
    }
    else
    {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  Paginate()
  {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    console.log(`Page: ${page}   Limit: ${limit}`);
    const skip = (page - 1) * limit;

    //page=2&limit=3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;