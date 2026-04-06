package dev.rowinski.kioskzsp4.user.mapping;

import dev.rowinski.kioskzsp4.user.User;
import dev.rowinski.kioskzsp4.user.dto.UserResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    UserResponseDTO toUserResponseDTO(User user);
}
