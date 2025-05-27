class APIFeatures {
    constructor(query, queryParams) {
      this.query = query; // Mongoose query object
      this.queryParams = queryParams; // Request query parameters
    }
  
    /**
     * Filter the query based on provided query parameters.
     */
    filter() {
      // Clone queryParams and exclude special fields for filtering
      const excludedFields = ["page", "limit", "sort", "fields"];
      const filterQuery = { ...this.queryParams };
      excludedFields.forEach(field => delete filterQuery[field]);
  
      // Modify query operators (e.g., gte -> $gte)
      let filterString = JSON.stringify(filterQuery);
      filterString = filterString.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
      
      // Apply filter to the query
      this.query = this.query.find(JSON.parse(filterString));
      return this;
    }
  
    /**
     * Sort the query results based on the sort parameter.
     */
    sort() {
      if (this.queryParams.sort) {
        const sortBy = this.queryParams.sort.split(",").join(" ");
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort("createdAt"); // Default sorting by creation date
      }
      return this;
    }
  
    /**
     * Select specific fields to be returned in the results.
     */
    select() {
      if (this.queryParams.fields) {
        const fields = this.queryParams.fields.split(",").join(" ");
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select("-__v"); // Exclude versioning field by default
      }
      return this;
    }
  
    /**
     * Paginate the query results based on page and limit parameters.
     */
    pagination() {
      const page = parseInt(this.queryParams.page, 10) || 1;
      const limit = parseInt(this.queryParams.limit, 10) || 10;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
  }
  
  module.exports = APIFeatures;
  