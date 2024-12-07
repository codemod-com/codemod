interface Transport {
  send(event: Event): Promise <TransportMakeRequestResponse> ;
}