import React, { useState } from "react";
import { connect } from "react-redux";
import { clearErrors } from "../../actions/productActions";

const Search = ({ history, error, clearErrors }) => {
  const [keyword, setKeyword] = useState("");

  const searchHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      history.push(`/search/${keyword}`);
    } else {
      history.push("/");
    }
    if (error) {
      setKeyword("");
      clearErrors();
    }
  };

  return (
    <form onSubmit={searchHandler}>
      <div className="input-group">
        <input
          type="text"
          id="search_field"
          className="form-control"
          placeholder="Enter Product Name ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <div className="input-group-append">
          <button type="submit" id="search_btn" className="btn">
            <i className="fa fa-search" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </form>
  );
};

const mapStateToProps = (state) => {
  return {
    error: state.products.error,
  };
};

export default connect(mapStateToProps, { clearErrors })(Search);
