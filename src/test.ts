// DID Document
type public_key = {
  id: string;
  type_: string;
  controller: string;
  public_key_hex: string;
}

type service = {
  id: string;
  type_: string;
  service_endpoint: string;
}

type did_document = {
  context: string[];
  id: string;
  public_keys: public_key[];
  services: service[];
}


// DID Registry Contract
class DIDRegistry {

  // DID Documents
  private documents: Map<string, DIDDocument> = new Map<string, DIDDocument>();

  // Create DID
  public create_did(did: string, context: string[], public_keys: PublicKey[], services: Service[]): void {
    if (this.documents.has(did)) {
      throw new Error("DID already exists");
    }

    const document: DIDDocument = {
      "@context": context,
      id: did,
      publicKeys: public_keys,
      service: services,
    }

    this.documents.set(did, document);
  }

  // Add Public Key
  public add_public_key(did: string, public_key: PublicKey): void {
    if (!this.documents.has(did)) {
      throw new Error("DID does not exist");
    }

    const existing_keys: PublicKey[] = this.documents.get(did)?.publicKeys ?? [];
    if (existing_keys.some(k => k.id === public_key.id)) {
      throw new Error("Public key already exists");
    }

    const updated_keys: PublicKey[] = existing_keys.concat(public_key);
    const updated_document: DIDDocument = { ...this.documents.get(did)!, publicKeys: updated_keys };
    this.documents.set(did, updated_document);
  }

  // Add Service
  public add_service(did: string, service: Service): void {
    if (!this.documents.has(did)) {
      throw new Error("DID does not exist");
    }

    const existing_services: Service[] = this.documents.get(did)?.service ?? [];
    if (existing_services.some(s => s.id === service.id)) {
      throw new Error("Service already exists");
    }

    const updated_services: Service[] = existing_services.concat(service);
    const updated_document: DIDDocument = { ...this.documents.get(did)!, service: updated_services };
    this.documents.set(did, updated_document);
  }

  // Get DID Document
  public get_did_document(did: string): DIDDocument {
    if (!this.documents.has(did)) {
      throw new Error("DID does not exist");
    }
    return this.documents.get(did)!;
  }

  // Register Name
  public register_name(name: string, did: string): void {
    if (this.documents.has(name)) {
      throw new Error("Name already registered");
    }
    if (!this.documents.has(did)) {
      throw new Error("DID does not exist");
    }

    const document: DIDDocument = this.documents.get(did)!;
    this.documents.set(name, document);
  }
}

