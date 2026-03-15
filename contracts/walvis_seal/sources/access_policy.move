/// WALVIS Access Policy for Seal encryption
/// Phase 1: Owner-only — only the creator can decrypt
/// Phase 2: Allowlist — owner can grant access to specific addresses
module walvis_seal::access_policy;

/// Error codes
const ENotOwner: u64 = 0;
const ENotAllowed: u64 = 1;
const EAlreadyInList: u64 = 2;
const ENotInList: u64 = 3;

/// A shared object representing access control for a WALVIS space.
/// The owner can decrypt, and can add/remove addresses to the allowlist.
public struct SpaceAccess has key, store {
    id: UID,
    owner: address,
    allowlist: vector<address>,
    space_name: vector<u8>,
}

// ─── Create / Destroy ────────────────────────────────────────

/// Create a new access policy for a space. The caller becomes the owner.
public fun create(space_name: vector<u8>, ctx: &mut TxContext): SpaceAccess {
    SpaceAccess {
        id: object::new(ctx),
        owner: ctx.sender(),
        allowlist: vector::empty(),
        space_name,
    }
}

/// Create and share the access policy object.
public fun create_and_share(space_name: vector<u8>, ctx: &mut TxContext) {
    let access = create(space_name, ctx);
    transfer::share_object(access);
}

// ─── Seal approve (Phase 1 + 2) ─────────────────────────────

/// Seal calls this function to check if the caller can decrypt.
/// Access is granted if the caller is the owner OR is on the allowlist.
entry fun seal_approve(_id: vector<u8>, access: &SpaceAccess, ctx: &TxContext) {
    let sender = ctx.sender();
    assert!(
        sender == access.owner || vector::contains(&access.allowlist, &sender),
        ENotAllowed,
    );
}

// ─── Allowlist management (Phase 2) ─────────────────────────

/// Add an address to the allowlist. Only the owner can call this.
public fun add_to_allowlist(access: &mut SpaceAccess, addr: address, ctx: &TxContext) {
    assert!(ctx.sender() == access.owner, ENotOwner);
    assert!(!vector::contains(&access.allowlist, &addr), EAlreadyInList);
    vector::push_back(&mut access.allowlist, addr);
}

/// Remove an address from the allowlist. Only the owner can call this.
public fun remove_from_allowlist(access: &mut SpaceAccess, addr: address, ctx: &TxContext) {
    assert!(ctx.sender() == access.owner, ENotOwner);
    let (found, idx) = vector::index_of(&access.allowlist, &addr);
    assert!(found, ENotInList);
    vector::remove(&mut access.allowlist, idx);
}

/// Batch add multiple addresses. Only the owner can call this.
public fun add_batch_to_allowlist(access: &mut SpaceAccess, addrs: vector<address>, ctx: &TxContext) {
    assert!(ctx.sender() == access.owner, ENotOwner);
    let mut i = 0;
    let len = vector::length(&addrs);
    while (i < len) {
        let addr = *vector::borrow(&addrs, i);
        if (!vector::contains(&access.allowlist, &addr)) {
            vector::push_back(&mut access.allowlist, addr);
        };
        i = i + 1;
    };
}

/// Clear the entire allowlist. Only the owner can call this.
public fun clear_allowlist(access: &mut SpaceAccess, ctx: &TxContext) {
    assert!(ctx.sender() == access.owner, ENotOwner);
    access.allowlist = vector::empty();
}

/// Transfer ownership. Only the current owner can call this.
public fun transfer_ownership(access: &mut SpaceAccess, new_owner: address, ctx: &TxContext) {
    assert!(ctx.sender() == access.owner, ENotOwner);
    access.owner = new_owner;
}

// ─── View functions ─────────────────────────────────────────

public fun owner(access: &SpaceAccess): address {
    access.owner
}

public fun allowlist(access: &SpaceAccess): &vector<address> {
    &access.allowlist
}

public fun space_name(access: &SpaceAccess): &vector<u8> {
    &access.space_name
}

public fun is_allowed(access: &SpaceAccess, addr: address): bool {
    addr == access.owner || vector::contains(&access.allowlist, &addr)
}
