
// DID Document
type didDocument = {
    "@context": string list;
    id: string;
    publicKeys: publicKey list;
    service: service list;
  }
  
  and publicKey = {
    id: string;
    type_: string;
    controller: string;
    publicKeyHex: string;
  }
  
  and service = {
    id: string;
    type_: string;
    serviceEndpoint: string;
  }
  
  // DID Registry Contract
  contract DIDRegistry =
  
    // DID Documents
    let documents: (string, didDocument) storage = Storage.create()
  
    // Create DID
    public create_did (did: string, context: string list, public_keys: publicKey list, services: service list) : unit =
      require(not(Storage.mem(documents, did)), "DID already exists")
  
      let document = {
        "@context" = context;
        id = did;
        publicKeys = public_keys;
        service = services;
      }
  
      Storage.put(documents, did, document)
  
    // Add Public Key
    public add_public_key (did: string, public_key: publicKey) : unit =
      require(Storage.mem(documents, did), "DID does not exist")
  
      let existing_keys = Storage.get(documents, did).publicKeys
      require(not(List.exists (fun k -> k.id = public_key.id) existing_keys), "Public key already exists")
  
      let updated_keys = existing_keys @ [public_key]
      let updated_document = { Storage.get(documents, did) with publicKeys = updated_keys }
      Storage.put(documents, did, updated_document)
  
    // Add Service
    public add_service (did: string, service: service) : unit =
      require(Storage.mem(documents, did), "DID does not exist")
  
      let existing_services = Storage.get(documents, did).service
      require(not(List.exists (fun s -> s.id = service.id) existing_services), "Service already exists")
  
      let updated_services = existing_services @ [service]
      let updated_document = { Storage.get(documents, did) with service = updated_services }
      Storage.put(documents, did, updated_document)
  
    // Get DID Document
    public get_did_document (did: string) : didDocument =
      require(Storage.mem(documents, did), "DID does not exist")
      Storage.get(documents, did)
  
    // Register Name
    public register_name (name: string, did: string) : unit =
      require(not(Storage.mem(documents, name)), "Name already registered")
      require(Storage.mem(documents, did), "DID does not exist")
  
      Storage.put(documents, name, Storage.get(documents, did))

// please note this code is just an overview of my drafts, checking if this is the functionalities we need to implement

  
  