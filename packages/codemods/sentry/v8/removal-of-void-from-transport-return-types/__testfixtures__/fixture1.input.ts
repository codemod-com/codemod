interface Transport {
  send(event: Event): Promise < void | TransportMakeRequestResponse > ;
}