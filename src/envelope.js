export class Envelope {
  /** Create an Envelope
   * @param {number} sessionId - identifies the session associated with this asset
   * @param {ApiClient} apiClient - the API client object to use for server API calls
   * @param {geoPosition} geoPosition - 
   **/
  constructor(sessionId,apiClient,geoPosition) {
    this._envelopeId = "(unknown)";
    this._sessionId = sessionId;
    this._apiClient = apiClient;
    this._geoPosition = geoPosition;
  }

  /** @returns {String} human-readable representation of this asset **/
  toString() {
    return `Envelope ${this._assetId}`;
  }

  /** Create a new Envelope in the server to which we can attach audio recordings as assets
   * @returns {Promise} represents the pending API call **/
  connect() {
    let data = {
      session_id: this._sessionId
    };

    return this._apiClient.post("/envelopes/",data).
      then((data) => {
        this._envelopeId = data.envelope_id;
      });
  }

  /** Sends an audio file to the server 
   * @param {blob} audioData 
   * @param {string} fileName - name of the file
   * @return {Promise} - represents the API call */
  upload(audioData,fileName) {
    if (!this._envelopeId) {
      return Promise.reject("cannot upload audio without first connecting this envelope to the server");
    }

    let formData = new FormData();

    formData.append('session_id',this._sessionId);
    //formData.append('envelope_id',this._envelopeId);
    formData.append('file',audioData);
    //formData.append('latitude',1);// marker.position.lat());
    //formData.append('longitude',1); //marker.position.lng());

    let path = `/envelopes/${this._envelopeId}/`;

    console.info(`Uploading ${fileName} to envelope ${path}`);

    let options = {
      contentType: false,
      processData: false
    };

    return this._apiClient.patch(path,formData,options).
      then((data) => {
        console.info("UPLOADDATA",data);
      });
  }
}
