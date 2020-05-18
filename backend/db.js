function DatabaseWrapper() {
  this.getDetails = (placeID) => {
    return {
      name: "Praxis Dr. Covidweg",
      address: "Fledermausweg 19, 12020 Wuhan",
      field: "general practitioner",
    };
  };
}

export default DatabaseWrapper;
