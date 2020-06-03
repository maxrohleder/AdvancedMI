import React from "react";
import PopUp from "./PopUp";
const bcrypt = require("bcryptjs");

//impressum blueprint und hashing test :D
//https://www.schwaben.ihk.de/blueprint/servlet/resource/blob/547560/0f57d027d0430ca6bf88fc39718c5626/das-impressum-data.pdf
class Impressum extends React.Component {
  constructor(props) {
    super(props);
    this.state = { password: null };
  }
  test1 = () => {
    var salt = 10;
    var pw = "hello_PW!";
    var hash = bcrypt.hashSync(pw, salt);
    console.log("pw: " + pw);
    console.log("new_pw: " + hash);

    if (bcrypt.compareSync(pw, hash)) {
      console.log("true");
    } else {
      console.log("flase");
    }
  };
  test2 = () => {
    /* 
    bcrypt.compare(pw, thi, function (err, res) {
      if (res) {
        //match
        console.log("PW MATCH");
      } else {
        //no match
        console.log("NO match");
      }
    }); 
    */
  };
  render() {
    return (
      <div>
        <p>
          Max Müller e.K.
          <br />
          Inhaber: Max Müller <br />
          Maximilianstrasse 1 <br />
          12345 Neustadt
          <br />
          <br />
          Telefon: +49-821-789456 <br />
          Telefax: +49-821-456789 <br />
          Email: info@maxmueller.de <br />
          <br />
          Registergericht: Amtsgericht Neustadt
          <br />
          Registernummer: HRA 1234 <br />
          <br />
          Umsatzsteuer-Identifikationsnummer gemäß § 27 a <br />
          Umsatzsteuergesetz: DE 1234567 <br />
          <br />
          Wirtschaftsidentifikationsnummer
          <br />
          gemäß § 139 c Abgabenordnung: DE 1234567 <br />
          <br />
          Online-Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO Die Europäische
          Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
          bereit. Sie finden diese unter http://ec.europa.eu/consumers/odr/.{" "}
          <br />
          <br />
          Bei grundsätzlicher Ablehnung und keiner Verpflichtung an der
          Teilnahme eines Streitbeilegungsverfahrens vor einer
          Verbraucherschlichtungsstelle:
          <br />
          Wir sind nicht verpflichtet und bereit an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle nach
          dem Verbraucherstreitbeilegungsgesetz (VSBG) teilzunehmen.
          <br />
          <br />
          Bei Bereitschaft und keiner Verpflichtung an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen: <br />
          Wir sind nicht verpflichtet aber bereit etwaige
          Meinungsverschiedenheiten aus Verbraucherverträgen außergerichtlich
          beizulegen. Wir sind deshalb zur Durchführung eines
          Streitbeilegungsverfahrens vor …. (Nennung der Schlichtungsstelle
          inkl. Adresse und Internetseite) bereit, wenn der Verbraucher den
          streitigen Anspruch zuvor uns gegenüber geltend gemacht hat. Der
          Rechtsweg steht Verbrauchern natürlich jederzeit offen.
          <br />
          <br />
          {this.test1()}
        </p>
        <PopUp txt={"hey"} speaker={"impressum"} praxisID={"impressum"} />
      </div>
    );
  }
}

export default Impressum;
