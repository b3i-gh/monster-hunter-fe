import { useState, useEffect } from "react";

const useFetchCans = (APIURL) => {
  const [fetchedCans, setFetchedCans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCans = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(APIURL);
      const data = await response.json();
      setFetchedCans(data);
    } catch (error) {
      console.error("Failed to fetch cans: ", error.message);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCans();
  }, [APIURL]);

  return { fetchedCans, loading, refreshing, fetchCans };
};

export default useFetchCans;
